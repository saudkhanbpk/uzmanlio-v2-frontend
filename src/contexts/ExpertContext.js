import React, { createContext, useContext, useReducer, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

// ================= INITIAL STATE =================
const initialState = {
  // Basic user info
  user: null,
  information: {},
  socialMedia: {},
  expertInformation: {},
  expertPackages: {},
  expertPaymentInfo: {},
  availability: { alwaysAvailable: false, selectedSlots: [], lastUpdated: null },

  // Nested Data
  titles: [],
  education: [],
  experience: [],
  certificates: [],
  languages: [],
  skills: [],
  galleryFiles: [],
  services: [],
  packages: [],
  events: [],
  blogs: [],
  forms: [],
  customers: [],
  appointments: [],
  emails: [],
  calendarProviders: [],
  appointmentMappings: [],

  // UI and async helpers
  loading: {},
  errors: {},
};

// ================= ACTION TYPES =================
export const EXPERT_ACTIONS = {
  SET_USER: "SET_USER",
  UPDATE_USER: "UPDATE_USER",

  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",

  SET_TITLES: "SET_TITLES",
  ADD_TITLE: "ADD_TITLE",
  UPDATE_TITLE: "UPDATE_TITLE",
  DELETE_TITLE: "DELETE_TITLE",

  SET_EDUCATION: "SET_EDUCATION",
  ADD_EDUCATION: "ADD_EDUCATION",
  UPDATE_EDUCATION: "UPDATE_EDUCATION",
  DELETE_EDUCATION: "DELETE_EDUCATION",

  SET_EXPERIENCE: "SET_EXPERIENCE",
  ADD_EXPERIENCE: "ADD_EXPERIENCE",
  UPDATE_EXPERIENCE: "UPDATE_EXPERIENCE",
  DELETE_EXPERIENCE: "DELETE_EXPERIENCE",

  SET_CERTIFICATES: "SET_CERTIFICATES",
  ADD_CERTIFICATE: "ADD_CERTIFICATE",
  UPDATE_CERTIFICATE: "UPDATE_CERTIFICATE",
  DELETE_CERTIFICATE: "DELETE_CERTIFICATE",

  SET_LANGUAGES: "SET_LANGUAGES",
  ADD_LANGUAGE: "ADD_LANGUAGE",
  UPDATE_LANGUAGE: "UPDATE_LANGUAGE",
  DELETE_LANGUAGE: "DELETE_LANGUAGE",

  SET_SKILLS: "SET_SKILLS",
  ADD_SKILL: "ADD_SKILL",
  UPDATE_SKILL: "UPDATE_SKILL",
  DELETE_SKILL: "DELETE_SKILL",

  SET_GALLERY_FILES: "SET_GALLERY_FILES",
  ADD_GALLERY_FILE: "ADD_GALLERY_FILE",
  DELETE_GALLERY_FILE: "DELETE_GALLERY_FILE",

  SET_SERVICES: "SET_SERVICES",
  ADD_SERVICE: "ADD_SERVICE",
  UPDATE_SERVICE: "UPDATE_SERVICE",
  DELETE_SERVICE: "DELETE_SERVICE",

  SET_PACKAGES: "SET_PACKAGES",
  ADD_PACKAGE: "ADD_PACKAGE",
  UPDATE_PACKAGE: "UPDATE_PACKAGE",
  DELETE_PACKAGE: "DELETE_PACKAGE",

  SET_EVENTS: "SET_EVENTS",
  ADD_EVENT: "ADD_EVENT",
  UPDATE_EVENT: "UPDATE_EVENT",
  DELETE_EVENT: "DELETE_EVENT",

  SET_BLOGS: "SET_BLOGS",
  ADD_BLOG: "ADD_BLOG",
  UPDATE_BLOG: "UPDATE_BLOG",
  DELETE_BLOG: "DELETE_BLOG",

  SET_FORMS: "SET_FORMS",
  ADD_FORM: "ADD_FORM",
  UPDATE_FORM: "UPDATE_FORM",
  DELETE_FORM: "DELETE_FORM",

  SET_CUSTOMERS: "SET_CUSTOMERS",
  ADD_CUSTOMER: "ADD_CUSTOMER",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",

  SET_APPOINTMENTS: "SET_APPOINTMENTS",
  ADD_APPOINTMENT: "ADD_APPOINTMENT",
  UPDATE_APPOINTMENT: "UPDATE_APPOINTMENT",
  DELETE_APPOINTMENT: "DELETE_APPOINTMENT",

  SET_EMAILS: "SET_EMAILS",
  ADD_EMAIL: "ADD_EMAIL",
  UPDATE_EMAIL: "UPDATE_EMAIL",
  DELETE_EMAIL: "DELETE_EMAIL",

  SET_AVAILABILITY: "SET_AVAILABILITY",
  UPDATE_AVAILABILITY: "UPDATE_AVAILABILITY",
};

// ================= REDUCER =================
const expertReducer = (state, action) => {
  // Add guard clause for undefined action
  if (!action || !action.type) {
    console.warn('Received invalid action:', action);
    return state;
  }

  switch (action.type) {
    // --- General User ---
    case EXPERT_ACTIONS.SET_USER:
      return { ...state, user: action.payload };

    case EXPERT_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    case EXPERT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.field]: action.payload.value },
      };

    case EXPERT_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.error },
      };

    // --- Generic array helpers ---
    case EXPERT_ACTIONS.SET_TITLES:
      return { ...state, titles: action.payload };
    case EXPERT_ACTIONS.ADD_TITLE:
      return { ...state, titles: [...state.titles, action.payload] };
    case EXPERT_ACTIONS.UPDATE_TITLE:
      return {
        ...state,
        titles: state.titles.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case EXPERT_ACTIONS.DELETE_TITLE:
      return { ...state, titles: state.titles.filter((t) => t.id !== action.payload) };

    // Education, Experience, Certificates, Languages, Skills, Gallery, Services, Packages, Events, Blogs, Forms, Customers, Appointments, Emails
    // Use same pattern for consistency
    case EXPERT_ACTIONS.ADD_EDUCATION:
      return { ...state, education: [...state.education, action.payload] };
    case EXPERT_ACTIONS.UPDATE_EDUCATION:
      return {
        ...state,
        education: state.education.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };
    case EXPERT_ACTIONS.DELETE_EDUCATION:
      return { ...state, education: state.education.filter((e) => e.id !== action.payload) };

    case EXPERT_ACTIONS.ADD_EXPERIENCE:
      return { ...state, experience: [...state.experience, action.payload] };
    case EXPERT_ACTIONS.UPDATE_EXPERIENCE:
      return {
        ...state,
        experience: state.experience.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };
    case EXPERT_ACTIONS.DELETE_EXPERIENCE:
      return { ...state, experience: state.experience.filter((e) => e.id !== action.payload) };

    case EXPERT_ACTIONS.SET_AVAILABILITY:
    case EXPERT_ACTIONS.UPDATE_AVAILABILITY:
      return { ...state, availability: action.payload };

    default: {
      const actionType = action.type;

      if (actionType.startsWith("SET_")) {
        const key = actionType.replace("SET_", "").toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        return { ...state, [key]: action.payload };
      }

      if (actionType.startsWith("ADD_")) {
        const key = actionType.replace("ADD_", "").toLowerCase() + "s";
        return { ...state, [key]: [...(state[key] || []), action.payload] };
      }

      if (actionType.startsWith("UPDATE_")) {
        const key = actionType.replace("UPDATE_", "").toLowerCase() + "s";
        return {
          ...state,
          [key]: (state[key] || []).map((item) =>
            item.id === action.payload.id ? action.payload : item
          ),
        };
      }

      if (actionType.startsWith("DELETE_")) {
        const key = actionType.replace("DELETE_", "").toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()) + "s";
        return {
          ...state,
          [key]: (state[key] || []).filter((item) => item.id !== action.payload)
        };
      }

      console.warn('Unknown action type:', actionType);
      return state;
    }
  }
};

// ================= CONTEXT =================
const ExpertContext = createContext();

export const ExpertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expertReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ExpertContext.Provider value={contextValue}>
      {children}
    </ExpertContext.Provider>
  );
};

export const useExpert = () => {
  const context = useContext(ExpertContext);
  if (!context) throw new Error("useExpert must be used within an ExpertProvider");
  return context;
};

export default ExpertContext;
