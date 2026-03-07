<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import ContactInfoCard from './ContactInfoCard.vue'
import CalendarPicker from './CalendarPicker.vue'
import TimeSlotPicker from './TimeSlotPicker.vue'
import BookingModal from './BookingModal.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import { useBookingApi } from '../composables/useBookingApi'

const toast = useToast()

const { createBooking, isLoading: isSubmitting, error: apiError } = useBookingApi()

const showBookingFlow = ref(false)
const selectedDate = ref<Date>()
const selectedTime = ref<string>()
const showModal = ref(false)
const showConfirmationModal = ref(false)
const bookingResult = ref<{ action: string; message: string; date?: string; time?: string; id?: string } | null>(null)

const canProceedToModal = computed(() => {
  return selectedDate.value && selectedTime.value
})

const startBooking = () => {
  showBookingFlow.value = true
  bookingResult.value = null
  apiError.value = null
}

const handleProceedToForm = () => {
  if (canProceedToModal.value) {
    showModal.value = true
  }
}

const handleCloseModal = () => {
  showModal.value = false
}

const handleCloseConfirmation = () => {
  showConfirmationModal.value = false
  // Reset selected date/time after closing confirmation
  selectedDate.value = undefined
  selectedTime.value = undefined
  bookingResult.value = null
}

const handleBookingSubmit = async (data: { name: string; email: string; description: string }) => {
  if (!selectedDate.value || !selectedTime.value) {
    toast.warning('Please select a date and time', {
      timeout: 3000,
    })
    return
  }

  // Format date as YYYY-MM-DD
  const bookingDate = selectedDate.value.toISOString().split('T')[0]

  if (!bookingDate) {
    toast.error('Invalid date selected', {
      timeout: 3000,
    })
    return
  }

  // Call the API
  const result = await createBooking({
    email: data.email,
    name: data.name,
    booking_date: bookingDate,
    booking_time: selectedTime.value,
    description: data.description,
  })

  if (result) {
    // Success!
    bookingResult.value = {
      action: result.action,
      message: result.message,
      date: result.booking.booking_date,
      time: result.booking.booking_time,
      id: result.booking.id,
    }

    console.log('=== BOOKING SUCCESSFUL ===')
    console.log('Action:', result.action)
    console.log('Booking ID:', result.booking.id)
    console.log('Date:', result.booking.booking_date)
    console.log('Time:', result.booking.booking_time)
    console.log('Name:', result.booking.name)
    console.log('Email:', result.booking.email)
    console.log('========================')

    // Close booking modal and reset flow
    showModal.value = false
    showBookingFlow.value = false

    // Show toast based on action type
    const actionText = result.action === 'updated' ? 'updated' : 'booked'
    const actionEmoji = result.action === 'updated' ? '✏️' : '🎉' 

    if (result.action !== 'updated') {
      // Creation: green toast (success)
      toast.success(`${actionEmoji} Your audit has been ${actionText} successfully!`, {
        timeout: 15000, // 15 seconds
      })
    } else {
      // Update: blue toast (info)
      toast.info(`${actionEmoji} Your audit has been ${actionText} successfully!`, {
        timeout: 15000, // 15 seconds
      })
    }

    // Show confirmation modal with preparation instructions
    showConfirmationModal.value = true
  } else {
    // Error - apiError.value will contain the error message
    toast.error(apiError.value || 'Booking failed. Please try again.', {
      timeout: 5000,
    })
  }
}

const cancelBooking = () => {
  showBookingFlow.value = false
  selectedDate.value = undefined
  selectedTime.value = undefined
}
</script>

<template>
  <section id="contact" class="py-20 px-6 bg-slate-50" aria-labelledby="contact-heading">
    <div class="max-w-6xl mx-auto">
      <h2
        id="contact-heading"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }"
        class="text-4xl font-bold text-slate-900 mb-4 text-center"
      >
        Let's Chat
      </h2>
      <p
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100, ease: 'easeOut' } }"
        class="text-center text-slate-600 mb-12 text-lg"
      >
        Ready to scale your infrastructure? Schedule a call with our team.
      </p>

      <!-- Contact Info Cards -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 200, ease: 'easeOut' } }"
        class="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto"
      >
        <ContactInfoCard title="Email" value="contact@accessdevops.com">
          <template #icon>
            <svg
              class="w-8 h-8 text-blue-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
          </template>
        </ContactInfoCard>
        <!-- <ContactInfoCard title="Phone" value="Available 24/7">
          <template #icon>
            <svg
              class="w-8 h-8 text-blue-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
              />
            </svg>
          </template>
        </ContactInfoCard> -->
        <ContactInfoCard title="Locations" value="3 Global Offices">
          <template #icon>
            <svg
              class="w-8 h-8 text-blue-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
              />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </template>
        </ContactInfoCard>
      </div>

      <!-- Booking System -->
      <div v-if="!showBookingFlow" class="text-center">
        <button
          @click="startBooking"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Schedule a Call
        </button>
      </div>

      <!-- Calendar and Time Picker -->
      <Transition
        enter-active-class="transition-all duration-500"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="showBookingFlow" class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <CalendarPicker v-model="selectedDate" />
            <TimeSlotPicker v-model="selectedTime" :selected-date="selectedDate" />
          </div>

          <div class="flex gap-4 justify-center">
            <button
              @click="cancelBooking"
              class="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleProceedToForm"
              :disabled="!canProceedToModal"
              :class="[
                'px-6 py-3 font-semibold rounded-lg transition-all',
                canProceedToModal
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed',
              ]"
            >
              Continue to Booking
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Booking Modal -->
    <BookingModal
      :is-open="showModal"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      :is-submitting="isSubmitting"
      @close="handleCloseModal"
      @submit="handleBookingSubmit"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showConfirmationModal"
      :action="bookingResult?.action as 'created' | 'updated'"
      :booking-date="bookingResult?.date"
      :booking-time="bookingResult?.time"
      :booking-id="bookingResult?.id"
      @close="handleCloseConfirmation"
    />
  </section>
</template>
