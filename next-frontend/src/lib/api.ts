import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";
import { ApiResponse, Item, ItemCreate, ItemUpdate, User, UserInfo } from "./types";

/**
 * Base API URL
 *
 * In development, this uses the proxy defined in next.config.js
 * In production, this should point to your API server
 */
const API_BASE_URL = "/api/backend";

/**
 * Create an Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Add request interceptor for authentication
 *
 * This interceptor adds the access token to all API requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Get the current session
    const session = await getSession();

    // Add the access token to the request if available
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Generic API request function
 *
 * @param config Axios request configuration
 * @returns API response
 */
async function apiRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return { data: response.data };
  } catch (error: any) {
    console.error("API Error:", error);
    return {
      error: error.response?.data?.detail || error.message || "An error occurred",
    };
  }
}

/**
 * Item API functions
 */
export const itemApi = {
  /**
   * Get all items
   *
   * @returns List of items
   */
  getItems: async (): Promise<ApiResponse<Item[]>> => {
    return apiRequest<Item[]>({
      method: "GET",
      url: "/items",
    });
  },

  /**
   * Get all items (admin view)
   *
   * @returns List of all items in the system
   */
  getAllItems: async (): Promise<ApiResponse<Item[]>> => {
    return apiRequest<Item[]>({
      method: "GET",
      url: "/items",
      params: { all_items: true },
    });
  },

  /**
   * Get a specific item by ID
   *
   * @param id Item ID
   * @returns Item details
   */
  getItem: async (id: number): Promise<ApiResponse<Item>> => {
    return apiRequest<Item>({
      method: "GET",
      url: `/items/${id}`,
    });
  },

  /**
   * Get items owned by the current user
   *
   * @returns List of user's items
   */
  getUserItems: async (): Promise<ApiResponse<Item[]>> => {
    return apiRequest<Item[]>({
      method: "GET",
      url: "/items/me",
    });
  },

  /**
   * Create a new item
   *
   * @param item Item data
   * @returns Created item
   */
  createItem: async (item: ItemCreate): Promise<ApiResponse<Item>> => {
    return apiRequest<Item>({
      method: "POST",
      url: "/items",
      data: item,
    });
  },

  /**
   * Update an existing item
   *
   * @param id Item ID
   * @param item Updated item data
   * @returns Updated item
   */
  updateItem: async (id: number, item: ItemUpdate): Promise<ApiResponse<Item>> => {
    return apiRequest<Item>({
      method: "PUT",
      url: `/items/${id}`,
      data: item,
    });
  },

  /**
   * Delete an item
   *
   * @param id Item ID
   * @returns Success status
   */
  deleteItem: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>({
      method: "DELETE",
      url: `/items/${id}`,
    });
  },
};

/**
 * User API functions
 */
export const userApi = {
  /**
   * Get the current user's information from Keycloak
   *
   * @returns User information from Keycloak
   */
  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    return apiRequest<UserInfo>({
      method: "GET",
      url: "/users/me",
    });
  },

  /**
   * Get user profile information from the application database
   *
   * @returns User profile
   */
  getUserProfile: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>({
      method: "GET",
      url: "/users/me/profile",
    });
  },

  /**
   * Update user profile information
   *
   * @param profileData Profile data to update
   * @returns Updated user profile
   */
  updateUserProfile: async (profileData: any): Promise<ApiResponse<User>> => {
    return apiRequest<User>({
      method: "PUT",
      url: "/users/me/profile",
      data: profileData,
    });
  },

  /**
   * Get all users (admin only)
   *
   * @returns List of users
   */
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>({
      method: "GET",
      url: "/users",
    });
  },
};
