<script setup lang="ts">
import { ref, watch } from 'vue'
import WarningCircle from '@/components/icons/WarningCircle.vue'

const props = defineProps<{
    open: boolean,
    title: string,
    entity: {
        id: string | number,
        title?: string
    }
}>()

const dialog = ref(false)

const emit = defineEmits<{
    (e: 'close', open: boolean): void,
    (e: 'delete', options: { open: boolean, entityId: string | number }): void,
}>()

function closeEvt() {
  dialog.value = false;
  emit("close", false);
}

function deleteEvt(closeFlag: boolean, id: number | string) {
    dialog.value = false;
    emit("delete", { open: closeFlag, entityId: id })
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
    <v-card class="tw-flex tw-flex-col tw-items-center !tw-rounded-2xl dark:!tw-bg-dark-panel sm:!tw-p-[28px] md:!tw-p-[48px] min-lg:!tw-p-[48px]">
        <WarningCircle stroke="#EF4B27" />
        <span class="dark:tw-text-light tw-text-2xl tw-mb-[10px] tw-text-center tw-max-w-[320px]">{{ props.title }}</span>
        <div class="tw-flex tw-flex-col tw-items-center tw-mb-5">
            <span class="dark:tw-text-light">{{ props.entity.title }}</span>
        </div>
        <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5" variant="elevated" color="#EF4B27" @click="deleteEvt(false, props.entity.id)">
            <span class="tw-tracking-normal tw-normal-case">Удалить</span>
        </v-btn>
        <v-btn class="!tw-rounded-xl !tw-h-[50px] tw-w-full tw-mt-5" variant="outlined" color="#04B6F5" @click="closeEvt">
            <span class="tw-tracking-normal tw-normal-case">Отмена</span>
        </v-btn>
      </v-card>
    </v-dialog>
</template>
