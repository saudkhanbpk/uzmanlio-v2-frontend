import React, { createContext, useContext, useReducer, useMemo } from 'react';

// Initial state
const initialState = {
  // Expert basic information
  title: '',
  titles: [], // Array of title objects
  expertCategories: [],

  // Education
  education: [],

  // Certificates
  certificates: [],

  // Experience
  experience: [],

  // Skills/Expertise
  skills: [],

  // Files for gallery
  galleryFiles: [],

  // Services
  services: [],
  activeServices: [], // Services available for booking

  // Packages
  packages: [],
  activePackages: [], // Packages purchased by consultees
  availablePackages: [], // Packages available for purchase

  // Calendar and availability
  availability: {
    alwaysAvailable: false,
    selectedSlots: [],
    lastUpdated: null
  },
  appointments: [],

  // Loading states
  loading: {
    education: false,
    certificates: false,
    experience: false,
    skills: false,
    services: false,
    packages: false,
    galleryFiles: false,
    title: false,
    titles: false,
    categories: false,
    availability: false,
    appointments: false
  },

  // Error states
  errors: {
    education: null,
    certificates: null,
    experience: null,
    skills: null,
    services: null,
    packages: null,
    galleryFiles: null,
    title: null,
    titles: null,
    categories: null,
    availability: null,
    appointments: null
  }
};

// Action types
export const EXPERT_ACTIONS = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',

  // Title actions
  SET_TITLE: 'SET_TITLE',
  SET_TITLES: 'SET_TITLES',
  UPDATE_TITLE: 'UPDATE_TITLE',
  ADD_TITLE: 'ADD_TITLE',
  DELETE_TITLE: 'DELETE_TITLE',

  // Categories actions
  SET_CATEGORIES: 'SET_CATEGORIES',
  ADD_CATEGORY: 'ADD_CATEGORY',
  REMOVE_CATEGORY: 'REMOVE_CATEGORY',

  // Education actions
  SET_EDUCATION: 'SET_EDUCATION',
  ADD_EDUCATION: 'ADD_EDUCATION',
  UPDATE_EDUCATION: 'UPDATE_EDUCATION',
  DELETE_EDUCATION: 'DELETE_EDUCATION',

  // Certificate actions
  SET_CERTIFICATES: 'SET_CERTIFICATES',
  ADD_CERTIFICATE: 'ADD_CERTIFICATE',
  UPDATE_CERTIFICATE: 'UPDATE_CERTIFICATE',
  DELETE_CERTIFICATE: 'DELETE_CERTIFICATE',

  // Experience actions
  SET_EXPERIENCE: 'SET_EXPERIENCE',
  ADD_EXPERIENCE: 'ADD_EXPERIENCE',
  UPDATE_EXPERIENCE: 'UPDATE_EXPERIENCE',
  DELETE_EXPERIENCE: 'DELETE_EXPERIENCE',

  // Skills actions
  SET_SKILLS: 'SET_SKILLS',
  ADD_SKILL: 'ADD_SKILL',
  UPDATE_SKILL: 'UPDATE_SKILL',
  DELETE_SKILL: 'DELETE_SKILL',

  // Gallery files actions
  SET_GALLERY_FILES: 'SET_GALLERY_FILES',
  ADD_GALLERY_FILE: 'ADD_GALLERY_FILE',
  DELETE_GALLERY_FILE: 'DELETE_GALLERY_FILE',

  // Services actions
  SET_SERVICES: 'SET_SERVICES',
  SET_ACTIVE_SERVICES: 'SET_ACTIVE_SERVICES',
  ADD_SERVICE: 'ADD_SERVICE',
  UPDATE_SERVICE: 'UPDATE_SERVICE',
  DELETE_SERVICE: 'DELETE_SERVICE',
  TOGGLE_SERVICE_ACTIVE: 'TOGGLE_SERVICE_ACTIVE',

  // Packages actions
  SET_PACKAGES: 'SET_PACKAGES',
  SET_ACTIVE_PACKAGES: 'SET_ACTIVE_PACKAGES',
  SET_AVAILABLE_PACKAGES: 'SET_AVAILABLE_PACKAGES',
  ADD_PACKAGE: 'ADD_PACKAGE',
  UPDATE_PACKAGE: 'UPDATE_PACKAGE',
  DELETE_PACKAGE: 'DELETE_PACKAGE',
  TOGGLE_PACKAGE_AVAILABLE: 'TOGGLE_PACKAGE_AVAILABLE',

  // Calendar and availability actions
  SET_AVAILABILITY: 'SET_AVAILABILITY',
  UPDATE_AVAILABILITY: 'UPDATE_AVAILABILITY',
  SET_APPOINTMENTS: 'SET_APPOINTMENTS',
  ADD_APPOINTMENT: 'ADD_APPOINTMENT',
  UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
  DELETE_APPOINTMENT: 'DELETE_APPOINTMENT'
};

// Reducer function
const expertReducer = (state, action) => {
  switch (action.type) {
    case EXPERT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.field]: action.payload.value
        }
      };

    case EXPERT_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error
        }
      };

    // Title actions
    case EXPERT_ACTIONS.SET_TITLE:
      return {
        ...state,
        title: action.payload,
        titles: Array.isArray(action.payload) ? action.payload : state.titles
      };

    case EXPERT_ACTIONS.SET_TITLES:
      return {
        ...state,
        titles: action.payload
      };

    case EXPERT_ACTIONS.UPDATE_TITLE:
      return {
        ...state,
        titles: state.titles.map(title =>
          title.id === action.payload.id ? action.payload : title
        )
      };

    case EXPERT_ACTIONS.ADD_TITLE:
      return {
        ...state,
        titles: [...state.titles, action.payload]
      };

    case EXPERT_ACTIONS.DELETE_TITLE:
      return {
        ...state,
        titles: state.titles.filter(title => title.id !== action.payload)
      };

    // Categories actions
    case EXPERT_ACTIONS.SET_CATEGORIES:
      return {
        ...state,
        expertCategories: action.payload
      };

    case EXPERT_ACTIONS.ADD_CATEGORY:
      return {
        ...state,
        expertCategories: [...state.expertCategories, action.payload]
      };

    case EXPERT_ACTIONS.REMOVE_CATEGORY:
      return {
        ...state,
        expertCategories: state.expertCategories.filter(cat => cat.id !== action.payload)
      };

    // Education actions
    case EXPERT_ACTIONS.SET_EDUCATION:
      return {
        ...state,
        education: action.payload
      };

    case EXPERT_ACTIONS.ADD_EDUCATION:
      return {
        ...state,
        education: [...state.education, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_EDUCATION:
      return {
        ...state,
        education: state.education.map(edu =>
          edu.id === action.payload.id ? action.payload : edu
        )
      };

    case EXPERT_ACTIONS.DELETE_EDUCATION:
      return {
        ...state,
        education: state.education.filter(edu => edu.id !== action.payload)
      };

    // Certificate actions
    case EXPERT_ACTIONS.SET_CERTIFICATES:
      return {
        ...state,
        certificates: action.payload
      };

    case EXPERT_ACTIONS.ADD_CERTIFICATE:
      return {
        ...state,
        certificates: [...state.certificates, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_CERTIFICATE:
      return {
        ...state,
        certificates: state.certificates.map(cert =>
          cert.id === action.payload.id ? action.payload : cert
        )
      };

    case EXPERT_ACTIONS.DELETE_CERTIFICATE:
      return {
        ...state,
        certificates: state.certificates.filter(cert => cert.id !== action.payload)
      };

    // Experience actions
    case EXPERT_ACTIONS.SET_EXPERIENCE:
      return {
        ...state,
        experience: action.payload
      };

    case EXPERT_ACTIONS.ADD_EXPERIENCE:
      return {
        ...state,
        experience: [...state.experience, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_EXPERIENCE:
      return {
        ...state,
        experience: state.experience.map(exp =>
          exp.id === action.payload.id ? action.payload : exp
        )
      };

    case EXPERT_ACTIONS.DELETE_EXPERIENCE:
      return {
        ...state,
        experience: state.experience.filter(exp => exp.id !== action.payload)
      };

    // Skills actions
    case EXPERT_ACTIONS.SET_SKILLS:
      return {
        ...state,
        skills: action.payload
      };

    case EXPERT_ACTIONS.ADD_SKILL:
      return {
        ...state,
        skills: [...state.skills, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_SKILL:
      return {
        ...state,
        skills: state.skills.map(skill =>
          skill.id === action.payload.id ? action.payload : skill
        )
      };

    case EXPERT_ACTIONS.DELETE_SKILL:
      return {
        ...state,
        skills: state.skills.filter(skill => skill.id !== action.payload)
      };

    // Gallery files actions
    case EXPERT_ACTIONS.SET_GALLERY_FILES:
      return {
        ...state,
        galleryFiles: action.payload
      };

    case EXPERT_ACTIONS.ADD_GALLERY_FILE:
      return {
        ...state,
        galleryFiles: [...state.galleryFiles, action.payload]
      };

    case EXPERT_ACTIONS.DELETE_GALLERY_FILE:
      return {
        ...state,
        galleryFiles: state.galleryFiles.filter(file => file.id !== action.payload)
      };

    // Services actions
    case EXPERT_ACTIONS.SET_SERVICES:
      return {
        ...state,
        services: action.payload
      };

    case EXPERT_ACTIONS.SET_ACTIVE_SERVICES:
      return {
        ...state,
        activeServices: action.payload
      };

    case EXPERT_ACTIONS.ADD_SERVICE:
      return {
        ...state,
        services: [...state.services, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_SERVICE:
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.id ? action.payload : service
        )
      };

    case EXPERT_ACTIONS.DELETE_SERVICE:
      return {
        ...state,
        services: state.services.filter(service => service.id !== action.payload),
        activeServices: state.activeServices.filter(service => service.id !== action.payload)
      };

    case EXPERT_ACTIONS.TOGGLE_SERVICE_ACTIVE:
      const service = state.services.find(s => s.id === action.payload);
      if (!service) return state;

      const isActive = state.activeServices.some(s => s.id === action.payload);
      return {
        ...state,
        activeServices: isActive
          ? state.activeServices.filter(s => s.id !== action.payload)
          : [...state.activeServices, service]
      };

    // Packages actions
    case EXPERT_ACTIONS.SET_PACKAGES:
      return {
        ...state,
        packages: action.payload
      };

    case EXPERT_ACTIONS.SET_ACTIVE_PACKAGES:
      return {
        ...state,
        activePackages: action.payload
      };

    case EXPERT_ACTIONS.SET_AVAILABLE_PACKAGES:
      return {
        ...state,
        availablePackages: action.payload
      };

    case EXPERT_ACTIONS.ADD_PACKAGE:
      return {
        ...state,
        packages: [...state.packages, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_PACKAGE:
      return {
        ...state,
        packages: state.packages.map(pkg =>
          pkg.id === action.payload.id ? action.payload : pkg
        )
      };

    case EXPERT_ACTIONS.DELETE_PACKAGE:
      return {
        ...state,
        packages: state.packages.filter(pkg => pkg.id !== action.payload),
        activePackages: state.activePackages.filter(pkg => pkg.id !== action.payload),
        availablePackages: state.availablePackages.filter(pkg => pkg.id !== action.payload)
      };

    case EXPERT_ACTIONS.TOGGLE_PACKAGE_AVAILABLE:
      const packageItem = state.packages.find(p => p.id === action.payload);
      if (!packageItem) return state;

      const isAvailable = state.availablePackages.some(p => p.id === action.payload);
      return {
        ...state,
        availablePackages: isAvailable
          ? state.availablePackages.filter(p => p.id !== action.payload)
          : [...state.availablePackages, packageItem]
      };

    // Calendar and availability actions
    case EXPERT_ACTIONS.SET_AVAILABILITY:
      return {
        ...state,
        availability: action.payload
      };

    case EXPERT_ACTIONS.UPDATE_AVAILABILITY:
      return {
        ...state,
        availability: {
          ...state.availability,
          ...action.payload,
          lastUpdated: new Date()
        }
      };

    case EXPERT_ACTIONS.SET_APPOINTMENTS:
      return {
        ...state,
        appointments: action.payload
      };

    case EXPERT_ACTIONS.ADD_APPOINTMENT:
      return {
        ...state,
        appointments: [...state.appointments, action.payload]
      };

    case EXPERT_ACTIONS.UPDATE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? action.payload : apt
        )
      };

    case EXPERT_ACTIONS.DELETE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload)
      };

    default:
      return state;
  }
};

// Create context
const ExpertContext = createContext();

// Provider component
export const ExpertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expertReducer, initialState);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch
  }), [state]);

  return (
    <ExpertContext.Provider value={contextValue}>
      {children}
    </ExpertContext.Provider>
  );
};

// Custom hook to use the context
export const useExpert = () => {
  const context = useContext(ExpertContext);
  if (!context) {
    throw new Error('useExpert must be used within an ExpertProvider');
  }
  return context;
};

export default ExpertContext;
