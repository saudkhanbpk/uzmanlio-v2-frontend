import React, { useState, useMemo, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { auth } from './services/Auth.js';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    information: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      phoneCode: '+90',
      birthday: '',
      gender: '',
      country: '',
      city: '',
      about: '',
    },
    username: '',
    password: '',
    confirmPassword: '',
    subscription: {
      plantype: 'individual',
      duration: 'monthly',
      cardNumber: '',
      expiry: '',
      cvv: '',
      cardHolderName: '',
      seats: 1, // Will be overridden to 2 when institutional
    },
    agreement: {
      status: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pricing
  const monthlyPrices = { individual: 500, institutional: 650, seatPrice: 100 };
  const yearlyPrices = { individual: 5000, institutional: 7400, seatPrice: 100 };

  const prices = formData.subscription.duration === 'yearly' ? yearlyPrices : monthlyPrices;

  // Auto-set seats to 2 when switching to institutional
  useEffect(() => {
    if (formData.subscription.plantype === 'institutional' && formData.subscription.seats < 2) {
      setFormData((prev) => ({
        ...prev,
        subscription: {
          ...prev.subscription,
          seats: 2,
        },
      }));
    }
  }, [formData.subscription.plantype]);

  const totalPrice = useMemo(() => {
    const base = formData.subscription.plantype === 'individual'
      ? prices.individual
      : prices.institutional;

    const extraSeats = formData.subscription.plantype === 'institutional'
      ? Math.max(0, formData.subscription.seats - 1)
      : 0;

    return base + extraSeats * prices.seatPrice;
  }, [formData.subscription.plantype, formData.subscription.duration, formData.subscription.seats, prices]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    const { information } = formData;

    if (!information.name.trim()) newErrors['information.name'] = 'First name is required';
    if (!information.surname.trim()) newErrors['information.surname'] = 'Last name is required';
    if (!information.email.trim()) newErrors['information.email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(information.email))
      newErrors['information.email'] = 'Invalid email format';

    if (!information.phone.trim()) newErrors['information.phone'] = 'Phone number is required';
    if (!information.country) newErrors['information.country'] = 'Select country';
    if (!information.city) newErrors['information.city'] = 'Select city';
    if (!information.gender) newErrors['information.gender'] = 'Select gender';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Must be at least 3 characters';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Must be at least 8 characters';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.agreement.status)
      newErrors['agreement.status'] = 'You must accept the terms';

    const { cardNumber, expiry, cvv, cardHolderName, plantype, seats } = formData.subscription;

    if (!cardHolderName.trim()) newErrors['subscription.cardHolderName'] = 'Cardholder name is required';
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/))
      newErrors['subscription.cardNumber'] = 'Valid 16-digit card number is required';
    if (!expiry.match(/^\d{4}-\d{2}$/))
      newErrors['subscription.expiry'] = 'Must be in YYYY-MM format';
    if (!cvv.match(/^\d{3,4}$/))
      newErrors['subscription.cvv'] = 'CVV must be 3 or 4 digits';

    if (plantype === 'institutional' && (!seats || seats < 2))
      newErrors['subscription.seats'] = 'At least 2 seats are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) handleSubmit();
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Calculate price
      const prices = formData.subscription.duration === 'yearly' ? yearlyPrices : monthlyPrices;
      const base = formData.subscription.plantype === 'individual'
        ? prices.individual
        : prices.institutional;
      const extraSeats = formData.subscription.plantype === 'institutional'
        ? Math.max(0, parseInt(formData.subscription.seats || '2', 10) - 1)
        : 0;
      const totalPrice = base + extraSeats * prices.seatPrice;

      // Prepare payload
      const signupData = {
        ...formData,
        price: totalPrice,
      };
      delete signupData.confirmPassword;

      const data = await auth.signUp(signupData);
      console.log("Sign up Data:", signupData);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (field) => errors[field] || '';

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-100 to-primary-200">
        <div className="flex-1 flex items-center justify-center p-8">
          <img
            src="https://images.pexels.com/photos/5475760/pexels-photo-5475760.jpeg"
            alt="Professional"
            className="max-w-full max-h-full object-cover rounded-3xl shadow-2xl"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 py-8">
          {/* Language Selector */}
          <div className="flex justify-end">
            <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer">
              <option>EN</option>
              <option>TR</option>
            </select>
          </div>

          {/* Logo */}
          <div className="text-center">
            <img
              src="https://uzmanlio.com/images/logo.png"
              alt="Uzmanlio Logo"
              className="h-12 mx-auto mb-2"
            />
            <div className="w-12 h-1 bg-green-400 mx-auto rounded-full"></div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {step === 1 ? 'Create Account' : 'Account Details'}
            </h2>
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-green-600 hover:text-green-700 ml-1 font-semibold">
                Sign in
              </a>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > 1 ? <CheckCircle2 size={20} /> : '1'}
              </div>
              <div className={`w-16 h-1 transition-all ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Global Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="space-y-4">
            {/* ---------- STEP 1: Personal Information ---------- */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Name & Surname */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="information.name"
                      value={formData.information.name}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        getErrorMessage('information.name')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-600'
                      }`}
                    />
                    {getErrorMessage('information.name') && (
                      <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.name')}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="information.surname"
                      value={formData.information.surname}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        getErrorMessage('information.surname')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-600'
                      }`}
                    />
                    {getErrorMessage('information.surname') && (
                      <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.surname')}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="information.email"
                    value={formData.information.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                      getErrorMessage('information.email')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-600'
                    }`}
                  />
                  {getErrorMessage('information.email') && (
                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.email')}</p>
                  )}
                </div>

                {/* Phone Code & Phone */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <select
                      name="information.phoneCode"
                      value={formData.information.phoneCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="+90">+90</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="tel"
                      name="information.phone"
                      value={formData.information.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        getErrorMessage('information.phone')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-600'
                      }`}
                    />
                    {getErrorMessage('information.phone') && (
                      <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.phone')}</p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <select
                    name="information.gender"
                    value={formData.information.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all bg-white ${
                      getErrorMessage('information.gender')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-600'
                    }`}
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {getErrorMessage('information.gender') && (
                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.gender')}</p>
                  )}
                </div>

                {/* Country & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      name="information.country"
                      value={formData.information.country}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all bg-white ${
                        getErrorMessage('information.country')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-600'
                      }`}
                    >
                      <option value="">Country</option>
                      <option value="turkey">Turkey</option>
                      <option value="usa">USA</option>
                      <option value="uk">UK</option>
                      <option value="india">India</option>
                    </select>
                    {getErrorMessage('information.country') && (
                      <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.country')}</p>
                    )}
                  </div>

                  <div>
                    <select
                      name="information.city"
                      value={formData.information.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all bg-white ${
                        getErrorMessage('information.city')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-600'
                      }`}
                    >
                      <option value="">City</option>
                      <option value="istanbul">Istanbul</option>
                      <option value="ankara">Ankara</option>
                      <option value="izmir">Izmir</option>
                      <option value="newyork">New York</option>
                    </select>
                    {getErrorMessage('information.city') && (
                      <p className="mt-1 text-xs text-red-600">{getErrorMessage('information.city')}</p>
                    )}
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <input
                    type="date"
                    name="information.birthday"
                    value={formData.information.birthday}
                    onChange={handleInputChange}
                    placeholder="Date of birth"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* About */}
                <div>
                  <textarea
                    name="information.about"
                    value={formData.information.about}
                    onChange={handleInputChange}
                    placeholder="About yourself (optional)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* ---------- STEP 2: Account, Subscription & Payment ---------- */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                      getErrorMessage('username')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-600'
                    }`}
                  />
                  {getErrorMessage('username') && (
                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('username')}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all pr-12 ${
                      getErrorMessage('password')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {getErrorMessage('password') && (
                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('password')}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all pr-12 ${
                      getErrorMessage('confirmPassword')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {getErrorMessage('confirmPassword') && (
                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('confirmPassword')}</p>
                  )}
                </div>

                {/* Subscription Plan */}
                <div className="pt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Subscription Plan</p>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="subscription.plantype"
                      value={formData.subscription.plantype}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="individual">Individual Expert</option>
                      <option value="institutional">Institutional</option>
                    </select>

                    <select
                      name="subscription.duration"
                      value={formData.subscription.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Institutional Seats */}
                {formData.subscription.plantype === 'institutional' && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Seats (Minimum 2)
                    </label>
                    <input
                      type="number"
                      name="subscription.seats"
                      value={formData.subscription.seats}
                      onChange={handleInputChange}
                      min="2"
                      step="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        getErrorMessage('subscription.seats')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-600'
                      }`}
                    />
                    {getErrorMessage('subscription.seats') && (
                      <p className="mt-1 text-xs text-red-600">{getErrorMessage('subscription.seats')}</p>
                    )}
                  </div>
                )}

                {/* Total Price */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalPrice.toLocaleString()}
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      /{formData.subscription.duration === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                </div>

                {/* Payment Details */}
                <div className="pt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Payment Details</p>
                  
                  <div className="space-y-3">
                    {/* Cardholder Name */}
                    <div>
                      <input
                        type="text"
                        name="subscription.cardHolderName"
                        value={formData.subscription.cardHolderName}
                        onChange={handleInputChange}
                        placeholder="Cardholder Name"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                          getErrorMessage('subscription.cardHolderName')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-green-600'
                        }`}
                      />
                      {getErrorMessage('subscription.cardHolderName') && (
                        <p className="mt-1 text-xs text-red-600">
                          {getErrorMessage('subscription.cardHolderName')}
                        </p>
                      )}
                    </div>

                    {/* Card Number */}
                    <div>
                      <input
                        type="text"
                        name="subscription.cardNumber"
                        value={formData.subscription.cardNumber}
                        onChange={handleInputChange}
                        placeholder="Card number"
                        maxLength={19}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                          getErrorMessage('subscription.cardNumber')
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-green-600'
                        }`}
                      />
                      {getErrorMessage('subscription.cardNumber') && (
                        <p className="mt-1 text-xs text-red-600">
                          {getErrorMessage('subscription.cardNumber')}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Expiry */}
                      <div>
                        <input
                          type="month"
                          name="subscription.expiry"
                          value={formData.subscription.expiry}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                            getErrorMessage('subscription.expiry')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-green-600'
                          }`}
                        />
                        {getErrorMessage('subscription.expiry') && (
                          <p className="mt-1 text-xs text-red-600">
                            {getErrorMessage('subscription.expiry')}
                          </p>
                        )}
                      </div>

                      {/* CVV */}
                      <div>
                        <input
                          type="text"
                          name="subscription.cvv"
                          value={formData.subscription.cvv}
                          onChange={handleInputChange}
                          placeholder="CVV"
                          maxLength={4}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                            getErrorMessage('subscription.cvv')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-green-600'
                          }`}
                        />
                        {getErrorMessage('subscription.cvv') && (
                          <p className="mt-1 text-xs text-red-600">
                            {getErrorMessage('subscription.cvv')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="pt-2">
                  <div className="flex items-start space-x-3">
                    <input
                      id="agreement"
                      type="checkbox"
                      name="agreement.status"
                      checked={formData.agreement.status}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-0.5 rounded cursor-pointer accent-green-600"
                    />
                    <label htmlFor="agreement" className="text-sm text-gray-700 cursor-pointer">
                      I have read and accept the{' '}
                      <span className="text-green-600 hover:text-green-700">Terms of Use</span> and{' '}
                      <span className="text-green-600 hover:text-green-700">Privacy Policy</span>
                    </label>
                  </div>
                  {getErrorMessage('agreement.status') && (
                    <p className="text-xs text-red-600 mt-1 ml-8">{getErrorMessage('agreement.status')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : step === 1 ? 'Continue' : 'Create Account'}
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}