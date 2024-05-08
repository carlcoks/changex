<script setup lang="ts">
import { ref, reactive } from 'vue'
import { login } from '@/api'
import { useRouter } from 'vue-router'
import { usePaymentsStore } from '@/stores/payments'
import RenderOn from '@/components/utils/RenderOn.vue'

const theme = localStorage.getItem('theme')

const $router = useRouter()
const paymentsStore = usePaymentsStore()

const form = ref<HTMLFormElement>(null)

const token = ref('')
const serverResponseCode = ref('')

function tokenLogin() {
    if (token.value !== '') {
        login(token.value).then(() => {
            form.value.resetValidation()
            paymentsStore.fetchAwaitingDisputesCount() // first request
            $router.push('/finances')
        }).catch((err) => {
            serverResponseCode.value = err.response.data.code
            form.value.validate()
        })
    }
}

const validationRules = reactive({
    required: (value: string) => !!value || 'Поле обязательно для заполнения',
    wrongToken: (_value: string) => {
        console.log(serverResponseCode.value)
        if (serverResponseCode.value === 'wrong_token') {
            return 'Неверный токен'
        } else {
            return ''
        }
    }
})
</script>

<template>
    <section
        tabindex="0"
        class="tw-flex tw-flex-col tw-justify-center tw-h-[calc(100vh-0px)] sm:tw-bg-white sm:dark:tw-bg-dark"
        @keydown.enter="tokenLogin"
    >
        <RenderOn :px="1280">
            <div
                class="tw-absolute tw-bg-radial-gradient tw-h-2/3 tw-w-1/2 -tw-bottom-[100px] -tw-left-[300px] -tw-z-10"
            ></div>
            <div
                class="tw-absolute tw-bg-radial-gradient tw-h-2/3 tw-w-1/2 -tw-top-[100px] -tw-right-[300px] -tw-z-10"
            ></div>
        </RenderOn>
        <section class="tw-flex tw-justify-center tw-items-center tw-gap-x-20">
            <RenderOn :px="1280">
                <img src="/login.png" />
            </RenderOn>
            <div
                class="tw-flex tw-flex-col tw-justify-center tw-items-center
                        md:tw-w-[512px] md:tw-h-[485px] min-lg:tw-w-[512px]
                        sm:tw-w-full sm:tw-h-full
                        min-lg:tw-h-[485px] light:tw-bg-white dark:tw-bg-dark-panel tw-rounded-2xl tw-gap-y-6"
            >
                <span class="light:tw-text-black dark:tw-text-white tw-text-2xl tw-font-semibold">Авторизация</span>
                <v-form ref="form" validate-on="submit lazy" @submit.prevent="tokenLogin">
                    <v-responsive class="mx-auto" min-width="320" max-width="462" min-height="82" max-height="82">
                        <v-text-field
                            v-model.trim="token"
                            label="Token"
                            variant="outlined"
                            single-line
                            :base-color="theme === 'dark' ? '#F7FBFD' : ''"
                            :color="theme === 'dark' ? '#F7FBFD' : ''"
                            :rules="[validationRules.required, validationRules.wrongToken]"
                            @keydown.enter="tokenLogin"
                        ></v-text-field>
                    </v-responsive>
                    <v-responsive class="mx-auto" min-width="320" max-width="462" min-height="72" max-height="72">
                        <v-btn
                            type="submit"
                            class="!tw-rounded-2xl !tw-normal-case !tw-w-full hover:!tw-shadow-[0px_10px_18px_2px_rgba(4,182,245,0.2)]"
                            variant="elevated"
                            color="#04B6F5"
                            size="x-large"
                        >
                            <span class="tw-text-white tw-text-[15px] tw-tracking-normal"
                                >Войти</span
                            >
                        </v-btn>
                    </v-responsive>
                </v-form>
            </div>
        </section>
    </section>
</template>
