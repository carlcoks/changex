<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import { copyToClipboard } from "@/utils"
import CopyIcon from "../../icons/CopyIcon.vue"
import Attention from "../../messages/Attention.vue"
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const props = defineProps<{
    open: boolean
}>()

const userStore = useUserStore()
const { walletAddress } = storeToRefs(userStore)

const dialog = ref(false)
const copySnackbar = reactive({
    show: false,
    text: 'Скопировано в буфер обмена.',
    timeout: 2000,
})

function copyAddr(addr: string) {
  copySnackbar.show = true
  copyToClipboard(addr)
}

const emit = defineEmits<{
    (e: 'close', open: boolean): void
}>()

function close(closeFlag: boolean) {
  dialog.value = closeFlag;
  emit("close", closeFlag);
}

watch(props, async (nextValue: Record<any, boolean>, _prevValue: Record<any, boolean>) => {
    dialog.value = nextValue.open
})
</script>

<template>
    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl !tw-p-[48px]">
        <span class="md:tw-text-2xl min-lg:tw-text-2xl sm:tw-text-xl tw-mb-[34px]">Пополнение баланса</span>
        <span class="tw-text-[#677483]">Адрес USDT</span>
        <div class="tw-flex tw-gap-x-4 tw-mb-[24px]">
          <span class="md:tw-text-lg min-lg:tw-text-lg sm:tw-text-xs tw-font-semibold">{{ walletAddress }}</span>
          <div class="tw-cursor-pointer tw-p-2" @click="copyAddr(walletAddress)">
            <CopyIcon />
          </div>
          <v-snackbar
            v-model="copySnackbar.show"
            :timeout="copySnackbar.timeout"
          >
            {{ copySnackbar.text }}

            <template v-slot:actions>
              <v-btn
                color="blue"
                variant="text"
                @click="copySnackbar.show = false"
              >
                Скрыть
              </v-btn>
              </template>
          </v-snackbar>
        </div>
        <div class="tw-mb-[24px] tw-min-w-[300px] tw-max-w-[466px] tw-text-center">
          <span class="tw-break-words tw-overflow-ellipsis">
            Данный кошелек привязан к Вам, пополняйте его в любое время дня и ночи - средства всегда зачислятся на баланс
          </span>
        </div>
        <Attention class="tw-mb-[24px]" text="Внимание! Не отправляйте USDT с Garantex - это приведет к блокировке аккаунта, также нельзя отправлять грязный по AML USDT" />
        <v-card-actions>
          <v-btn class="!tw-min-w-[310px] tw-max-w-[426px] !tw-rounded-xl !tw-normal-case" color="#04B6F5" variant="outlined" block @click="close(false)">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
