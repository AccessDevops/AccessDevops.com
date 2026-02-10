<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import MetricCard from './MetricCard.vue'
import ThreeBackground from './ThreeBackground.vue'
import CalendarPicker from './CalendarPicker.vue'
import TimeSlotPicker from './TimeSlotPicker.vue'
import BookingModal from './BookingModal.vue'
import ConfirmationModal from './ConfirmationModal.vue'
import { useBookingApi } from '../composables/useBookingApi'
import { useAnalytics } from '../composables/useAnalytics'

const toast = useToast()
const { trackBookingEvent, trackCTA } = useAnalytics()

const metrics = [
  { value: '34', label: 'Managed Servers' },
  { value: '373', label: 'Deployments' },
]

const { createBooking, isLoading: isSubmitting, error: apiError } = useBookingApi()

const showBookingFlow = ref(false)
const selectedDate = ref<Date>()
const selectedTime = ref<string>()
const showModal = ref(false)
const showConfirmationModal = ref(false)
const bookingContainerRef = ref<HTMLElement>()
const bookingResult = ref<{
  action: string
  message: string
  date?: string
  time?: string
  id?: string
} | null>(null)
const bookingButtonRef = ref<HTMLElement>()
const isVibrating = ref(false)
const badgeIconRef = ref<HTMLElement>()
const isBadgeAnimating = ref(false)

const canProceedToModal = computed(() => {
  return selectedDate.value && selectedTime.value
})

const startBooking = () => {
  showBookingFlow.value = true
  bookingResult.value = null
  apiError.value = null
  trackCTA('hero', 'Book a Call - Initial Click')
}

const handleProceedToForm = () => {
  if (canProceedToModal.value) {
    showModal.value = true
    trackBookingEvent('modal_opened', {
      date: selectedDate.value?.toISOString().split('T')[0],
      time: selectedTime.value,
    })
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

    // Track booking completion
    trackBookingEvent('completed', {
      action: result.action,
      booking_id: result.booking.id,
      date: result.booking.booking_date,
      time: result.booking.booking_time,
    })

    // Close booking modal and reset flow
    showModal.value = false
    showBookingFlow.value = false

    // Show toast based on action type
    const actionText = result.action === 'created' ? 'booked' : 'updated'
    const actionEmoji = result.action === 'created' ? '🎉' : '✏️'

    if (result.action === 'created') {
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

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  // Don't close if the booking modal is open
  if (showModal.value) return

  if (showBookingFlow.value && bookingContainerRef.value) {
    const target = event.target as Node
    if (!bookingContainerRef.value.contains(target)) {
      cancelBooking()
    }
  }
}

// Vibration animation effect for booking button
const startVibrationAnimation = () => {
  if (!showBookingFlow.value) {
    isVibrating.value = true
    setTimeout(() => {
      isVibrating.value = false
    }, 500) // Duration of the vibration animation
  }
}

// Badge icon animation effect
const startBadgeIconAnimation = () => {
  isBadgeAnimating.value = true
  setTimeout(() => {
    isBadgeAnimating.value = false
  }, 1000) // Duration of the badge animation
}

let vibrationInterval: number | undefined
let badgeIconInterval: number | undefined

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)

  // Start periodic vibration animation every 2.2 seconds
  vibrationInterval = window.setInterval(() => {
    startVibrationAnimation()
  }, 2250 * 2)

  // Start first vibration after 2.2 seconds
  setTimeout(() => {
    startVibrationAnimation()
  }, 2250)

  // Start periodic badge icon animation every 6 seconds
  badgeIconInterval = window.setInterval(() => {
    startBadgeIconAnimation()
  }, 2250 * 1.5)

  // Start first badge animation after 3 seconds
  setTimeout(() => {
    startBadgeIconAnimation()
  }, 2250 * 3)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  if (vibrationInterval !== undefined) {
    clearInterval(vibrationInterval)
  }
  if (badgeIconInterval !== undefined) {
    clearInterval(badgeIconInterval)
  }
})
</script>

<template>
  <section
    id="hero"
    class="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden bg-white"
    aria-label="Hero section - DevOps & Infrastructure Services"
  >
    <!-- Three.js Background with reduced opacity -->
    <div class="absolute inset-0 opacity-20">
      <ThreeBackground />
    </div>

    <div class="relative z-10 max-w-6xl mx-auto text-center">
      <h1
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100, ease: 'easeOut' } }"
        class="text-6xl md:text-7xl font-bold text-slate-900 mb-12 tracking-tight"
      >
        DevOps & Infrastructure<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
          Success as a Service
        </span>
      </h1>

      <!-- Hero Badge -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 300, ease: 'easeOut' } }"
        class="relative group inline-flex items-center gap-3.5 px-7 py-3.5 rounded-full bg-blue-100/60 border-2 border-blue-400/40 mb-12 cursor-help shadow-md hover:shadow-lg transition-shadow"
      >
        <svg
          ref="badgeIconRef"
          v-motion
          :initial="{ rotate: 0, scale: 1.5 }"
          :enter="{
            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
            scale: [1.5, 1.3, 1.3, 1.2, 1.2, 1.1, 1.1, 1],
            transition: {
              duration: 600,
              delay: 600,
              ease: 'easeOut',
            },
          }"
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="['text-blue-600', { 'badge-icon-animate': isBadgeAnimating }]"
        >
          <path
            d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
          ></path>
          <path d="M20 2v4"></path>
          <path d="M22 4h-4"></path>
          <circle cx="4" cy="20" r="2"></circle>
        </svg>
        <span class="text-xl font-medium text-blue-900 tracking-tight">
          Save 83% of your DevOps & Infra Cost
        </span>
        <span class="text-lg text-blue-500">ⓘ</span>
        <div
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg"
        >
          On average, our clients spend €1036 (including hosting fees).<br />
          A DevOps engineer represents a total employer cost of €6,042 per month.
        </div>
      </div>

      <!-- Metrics -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 500, ease: 'easeOut' } }"
        class="flex flex-wrap gap-6 mb-16 max-w-4xl mx-auto justify-center"
      >
        <div
          v-for="(metric, index) in metrics"
          :key="metric.label"
          v-motion
          :initial="{ opacity: 0, scale: 0.8 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { duration: 600, delay: 700 + index * 100, ease: 'easeOut' },
          }"
        >
          <MetricCard :value="metric.value" :label="metric.label" />
        </div>
      </div>

      <p
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 1100, ease: 'easeOut' } }"
        class="text-slate-700 text-xl leading-relaxed max-w-3xl mx-auto text-center mb-10"
      >
        Get Deployment, Automation and Reliability on-demand from our DevOps and Infrastructure
        Human Expertise at a Fraction of the Cost
        <a
          href="https://accessdevops.com/#comparison"
          target="_blank"
          rel="noopener noreferrer"
          class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-all hover:underline decoration-2 underline-offset-4"
        >
          by AccessDevOps
        </a>
      </p>

      <!-- Book Audit Button -->
      <div ref="bookingContainerRef" class="relative">
        <button
          ref="bookingButtonRef"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 1300, ease: 'easeOut' } }"
          :whileHover="{ scale: showBookingFlow ? 1 : 1.05 }"
          :whileTap="{ scale: showBookingFlow ? 1 : 0.95 }"
          @click="startBooking"
          :disabled="showBookingFlow"
          :class="[
            'inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all shadow-lg',
            showBookingFlow
              ? 'bg-blue-500 text-white cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl',
            { 'vibrate-button': isVibrating },
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Optimize your DevOps & Infra Costs — Book a Call
        </button>

        <!-- Calendar and Time Picker - Dialog bubble above button -->
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-4"
        >
          <div
            v-if="showBookingFlow"
            class="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-[90vw] max-w-5xl"
          >
            <div
              class="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 space-y-6"
            >
              <div class="grid md:grid-cols-2 gap-8">
                <CalendarPicker v-model="selectedDate" />
                <TimeSlotPicker v-model="selectedTime" :selected-date="selectedDate" />
              </div>

              <div class="flex gap-4 justify-center pt-4 border-t border-slate-200">
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

              <!-- Arrow pointing down to button -->
              <div
                class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-slate-200 rotate-45"
              ></div>
            </div>
          </div>
        </Transition>
      </div>
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
