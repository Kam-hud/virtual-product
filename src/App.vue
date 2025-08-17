<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
    userStore.initialize()
})
</script>

<template>
    <div class="app-container">
        <Header />
        <div class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
        <Footer />
    </div>
</template>

<style scoped></style>
