/**
 * Composable for interacting with the Booking API
 */

import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface BookingData {
  email: string
  name: string
  booking_date: string
  booking_time: string
  description: string
}

export interface BookingResponse {
  action: 'created' | 'updated' | 'forwarded'
  booking: {
    id: string | null
    email: string
    name: string
    booking_date: string
    booking_time: string
    description: string | null
    created_at: string | null
    updated_at: string | null
  }
  message: string
  persisted: boolean
}

export interface AvailableSlotsResponse {
  date: string
  available_slots: string[]
  booked_slots: string[]
}

export interface SurveyData {
  booking_id: string
  role?: string[]
  cloud_usage?: string[]
  development_approach?: string[]
  team_size?: string[]
  primary_goals?: string[]
  other_goal?: string
}

export interface SurveyResponse {
  id: string | null
  booking_id: string
  role: string[] | null
  cloud_usage: string[] | null
  development_approach: string[] | null
  team_size: string[] | null
  primary_goals: string[] | null
  other_goal: string | null
  created_at: string | null
}

export interface SurveyActionResponse {
  survey: SurveyResponse
  message: string
  persisted: boolean
}

export function useBookingApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create or update a booking
   */
  const createBooking = async (data: BookingData): Promise<BookingResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/api/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create booking')
      }

      const result: BookingResponse = await response.json()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Booking error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get available time slots for a specific date
   */
  const getAvailableSlots = async (date: string): Promise<string[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/available-slots?booking_date=${date}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch available slots')
      }

      const result: AvailableSlotsResponse = await response.json()
      return result.available_slots
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching available slots:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit a survey for a booking
   */
  const submitSurvey = async (data: SurveyData): Promise<SurveyActionResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/api/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to submit survey')
      }

      const result: SurveyActionResponse = await response.json()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Survey submission error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if the API is healthy
   */
  const checkHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/health`)
      return response.ok
    } catch (err) {
      console.error('Health check failed:', err)
      return false
    }
  }

  return {
    isLoading,
    error,
    createBooking,
    getAvailableSlots,
    submitSurvey,
    checkHealth,
  }
}
