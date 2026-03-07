<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useBookingApi, type SurveyData } from '../composables/useBookingApi'

const toast = useToast()
const { submitSurvey, isLoading: isSubmittingSurvey } = useBookingApi()

const props = defineProps<{
  isOpen: boolean
  action: 'created' | 'updated' | 'forwarded'
  bookingDate?: string
  bookingTime?: string
  bookingId?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const actionText = computed(() => (props.action === 'updated' ? 'updated' : 'booked'))
const actionEmoji = computed(() => (props.action === 'updated' ? '✏️' : '🎉'))

// Survey form state
const showSurvey = computed(() => props.action !== 'updated')
const surveyCompleted = ref(false)

// Reset survey when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    surveyCompleted.value = false
  }
})
const surveyData = ref({
  role: [] as string[],
  cloudUsage: [] as string[],
  developmentApproach: [] as string[],
  teamSize: [] as string[],
  primaryGoals: [] as string[],
  otherGoal: '',
})

const surveyQuestions = {
  role: {
    question: 'What is your role?',
    options: [
      'CEO',
      'CTO',
      'CPO',
      'Product Manager',
      'Developer',
      'DevOps',
      'CloudOps',
      'System Administrator',
      'Other',
    ],
  },
  cloudUsage: {
    question: 'What is your current cloud usage?',
    options: [
      'Not using cloud yet',
      'AWS',
      'Microsoft Azure',
      'Google Cloud Platform (GCP)',
      'OVHcloud',
      'Scaleway',
      'IONOS',
      'Other',
    ],
  },
  developmentApproach: {
    question: 'What is your current development approach?',
    options: [
      'In-House - Internal Development',
      'External Contractors or Consultants',
      'Hybrid',
    ],
  },
  teamSize: {
    question: 'What is the size of your development team?',
    options: ['1–5', '6–12', '12+'],
  },
  primaryGoals: {
    question: 'What are your primary goals for considering Access DevOps?',
    options: [
      'Accelerate software delivery / CI/CD',
      'Improve infrastructure reliability & uptime',
      'Reduce operational overhead',
      'Improve security & compliance',
      'Cost optimization',
      'Other (please specify)',
    ],
  },
}

const toggleOption = (array: string[], option: string) => {
  const index = array.indexOf(option)
  if (index > -1) {
    array.splice(index, 1)
  } else {
    array.push(option)
  }
}

const resetSurveyData = () => {
  surveyData.value = {
    role: [],
    cloudUsage: [],
    developmentApproach: [],
    teamSize: [],
    primaryGoals: [],
    otherGoal: '',
  }
}

const handleSurveySubmit = async () => {
  if (!props.bookingId) {
    console.error('No booking ID provided for survey submission')
    toast.error('Unable to submit survey: booking ID missing', {
      timeout: 5000,
    })
    return
  }

  console.log('=== SURVEY SUBMITTED ===')
  console.log('Survey Data:', surveyData.value)
  console.log('Booking ID:', props.bookingId)
  console.log('========================')

  // Prepare survey data for API
  const surveyPayload: SurveyData = {
    booking_id: props.bookingId,
    role: surveyData.value.role.length > 0 ? surveyData.value.role : undefined,
    cloud_usage: surveyData.value.cloudUsage.length > 0 ? surveyData.value.cloudUsage : undefined,
    development_approach:
      surveyData.value.developmentApproach.length > 0
        ? surveyData.value.developmentApproach
        : undefined,
    team_size: surveyData.value.teamSize.length > 0 ? surveyData.value.teamSize : undefined,
    primary_goals:
      surveyData.value.primaryGoals.length > 0 ? surveyData.value.primaryGoals : undefined,
    other_goal: surveyData.value.otherGoal || undefined,
  }

  // Submit survey to API
  const result = await submitSurvey(surveyPayload)

  if (result) {
    console.log('=== SURVEY SUBMITTED SUCCESSFULLY ===')
    console.log('Survey ID:', result.survey?.id)
    console.log('Persisted:', result.persisted)
    console.log('======================================')
    surveyCompleted.value = true
    resetSurveyData()
  } else {
    // Error occurred - show error toast
    toast.error('Failed to submit survey. Please try again.', {
      timeout: 5000,
    })
  }
}

const handleSkipSurvey = () => {
  surveyCompleted.value = true
  resetSurveyData()
}

const formattedDate = computed(() => {
  if (!props.bookingDate) return ''
  const date = new Date(props.bookingDate)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formattedTime = computed(() => {
  if (!props.bookingTime) return ''
  const [hour, minute] = props.bookingTime.split(':')
  const hourNum = parseInt(hour || '0')
  const period = hourNum >= 12 ? 'PM' : 'AM'
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
  return `${displayHour}:${minute || '00'} ${period}`
})

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      @click.self="handleClose"
    >
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-if="isOpen"
          class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 rounded-t-2xl text-white">
            <div class="flex items-start justify-between">
              <div>
                <div class="text-5xl mb-3">{{ actionEmoji }}</div>
                <h2 class="text-3xl font-bold mb-2">Audit {{ actionText }} successfully!</h2>
                <p class="text-blue-100 text-lg">
                  We'll contact you shortly to discuss your DevOps & Infrastructure needs
                </p>
              </div>
              <button
                @click="handleClose"
                class="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8 space-y-6">
            <!-- Appointment Details -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Your Appointment
              </h3>
              <div class="space-y-2 text-slate-700">
                <p><span class="font-semibold">Date:</span> {{ formattedDate }}</p>
                <p>
                  <span class="font-semibold">Time:</span> {{ formattedTime }}
                  <span class="text-sm text-slate-500">(Paris timezone)</span>
                </p>
              </div>
            </div>

            <!-- Survey Form (only for new bookings, shown first) -->
            <div v-if="showSurvey && !surveyCompleted" class="space-y-8">
              <div class="text-center pb-4 border-b border-slate-200">
                <h3 class="text-3xl font-bold text-slate-900 mb-3">
                  Thank you for scheduling your meeting!
                </h3>
                <p class="text-lg text-slate-600">
                  To help us prepare effectively, please consider filling out this quick 5-question
                  survey.
                </p>
              </div>

              <form @submit.prevent="handleSurveySubmit" class="space-y-8">
                <!-- Question 1: Role -->
                <div class="space-y-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <label class="block text-lg font-bold text-slate-900">
                    {{ surveyQuestions.role.question }}
                    <span class="block text-sm text-slate-500 font-normal mt-1">(Select all that apply)</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="option in surveyQuestions.role.options"
                      :key="option"
                      type="button"
                      @click="toggleOption(surveyData.role, option)"
                      :class="[
                        'px-4 py-2.5 text-sm font-medium rounded-full transition-all',
                        surveyData.role.includes(option)
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-300',
                      ]"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <!-- Question 2: Cloud Usage -->
                <div class="space-y-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <label class="block text-lg font-bold text-slate-900">
                    {{ surveyQuestions.cloudUsage.question }}
                    <span class="block text-sm text-slate-500 font-normal mt-1">(Select all that apply)</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="option in surveyQuestions.cloudUsage.options"
                      :key="option"
                      type="button"
                      @click="toggleOption(surveyData.cloudUsage, option)"
                      :class="[
                        'px-4 py-2.5 text-sm font-medium rounded-full transition-all',
                        surveyData.cloudUsage.includes(option)
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-300',
                      ]"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <!-- Question 3: Development Approach -->
                <div class="space-y-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <label class="block text-lg font-bold text-slate-900">
                    {{ surveyQuestions.developmentApproach.question }}
                    <span class="block text-sm text-slate-500 font-normal mt-1">(Select all that apply)</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="option in surveyQuestions.developmentApproach.options"
                      :key="option"
                      type="button"
                      @click="toggleOption(surveyData.developmentApproach, option)"
                      :class="[
                        'px-4 py-2.5 text-sm font-medium rounded-full transition-all',
                        surveyData.developmentApproach.includes(option)
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-300',
                      ]"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <!-- Question 4: Team Size -->
                <div class="space-y-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <label class="block text-lg font-bold text-slate-900">
                    {{ surveyQuestions.teamSize.question }}
                    <span class="block text-sm text-slate-500 font-normal mt-1">(Select all that apply)</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="option in surveyQuestions.teamSize.options"
                      :key="option"
                      type="button"
                      @click="toggleOption(surveyData.teamSize, option)"
                      :class="[
                        'px-4 py-2.5 text-sm font-medium rounded-full transition-all',
                        surveyData.teamSize.includes(option)
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-300',
                      ]"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <!-- Question 5: Primary Goals -->
                <div class="space-y-4 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <label class="block text-lg font-bold text-slate-900">
                    {{ surveyQuestions.primaryGoals.question }}
                    <span class="block text-sm text-slate-500 font-normal mt-1">(Select all that apply)</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="option in surveyQuestions.primaryGoals.options"
                      :key="option"
                      type="button"
                      @click="toggleOption(surveyData.primaryGoals, option)"
                      :class="[
                        'px-4 py-2.5 text-sm font-medium rounded-full transition-all',
                        surveyData.primaryGoals.includes(option)
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 hover:shadow-md border border-slate-300',
                      ]"
                    >
                      {{ option }}
                    </button>
                  </div>

                  <!-- Other Goal Text Input -->
                  <Transition
                    enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 -translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                  >
                    <div
                      v-if="surveyData.primaryGoals.includes('Other (please specify)')"
                      class="mt-2"
                    >
                      <input
                        v-model="surveyData.otherGoal"
                        type="text"
                        placeholder="Please specify..."
                        class="w-full px-4 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </Transition>
                </div>

                <!-- Form Actions -->
                <div class="flex gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    @click="handleSkipSurvey"
                    class="flex-1 px-8 py-4 border-2 border-slate-300 text-slate-700 font-bold text-lg rounded-xl hover:bg-slate-50 transition-all hover:shadow-md"
                  >
                    Skip Survey
                  </button>
                  <button
                    type="submit"
                    class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Submit Survey
                  </button>
                </div>
              </form>
            </div>

            <!-- Preparation Section (shown after survey or for updates) -->
            <div v-if="!showSurvey || surveyCompleted" class="space-y-4">
              <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Prepare for your audit
              </h3>
              <p class="text-slate-600 leading-relaxed">
                To provide you with the most accurate assessment and recommendations, please gather
                the following technical information before our call:
              </p>

              <div class="space-y-4">
                <!-- Infrastructure Details -->
                <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Current Infrastructure
                  </h4>
                  <ul class="space-y-2 text-slate-700 text-sm ml-4">
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Number and types of servers (cloud, on-premise, hybrid)</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Cloud providers used (AWS, Azure, GCP, etc.)</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Approximate monthly infrastructure costs</span>
                    </li>
                  </ul>
                </div>

                <!-- Deployment Process -->
                <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Deployment & Automation
                  </h4>
                  <ul class="space-y-2 text-slate-700 text-sm ml-4">
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Current CI/CD tools and processes</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Deployment frequency (daily, weekly, monthly)</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Automation level (manual, semi-automated, fully automated)</span>
                    </li>
                  </ul>
                </div>

                <!-- Pain Points -->
                <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Current Challenges
                  </h4>
                  <ul class="space-y-2 text-slate-700 text-sm ml-4">
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Main pain points with current setup</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Reliability or performance issues</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 mt-1">•</span>
                      <span>Team size dedicated to DevOps/Infrastructure</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Call to Action -->
              <div
                class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-slate-900 mb-2">
                      Don't worry if you don't have all the information
                    </h4>
                    <p class="text-slate-700 text-sm leading-relaxed">
                      We'll guide you through the audit process and help identify areas for
                      improvement. This preparation is optional but helps us provide more targeted
                      recommendations during our call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            v-if="!showSurvey || surveyCompleted"
            class="bg-slate-50 px-8 py-6 rounded-b-2xl flex justify-between items-center border-t border-slate-200"
          >
            <p class="text-sm text-slate-600">
              <!-- A confirmation email has been sent to your inbox -->
            </p>
            <button
              @click="handleClose"
              class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
