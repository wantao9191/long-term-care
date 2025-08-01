<template>
  <div class="w-100vw h-100vh flex">
    <div class="banner w-60% h-100vh">
      <div
        class="absolute top-50% left-50% translate-x-[-50%] translate-y-[-50%] z-10 text-white rounded-lg p-6 text-center backdrop-blur-md bg-white/20 border border-white/30 shadow-lg"
      >
        <div class="text-2xl font-bold">专业照护，让家人更放心</div>
        <div class="text-sm mt-xl">为每一位老人提供贴心的照护服务</div>
      </div>
    </div>
    <div class="login-box w-40% flex flex-col items-center justify-center">
      <div class="w-80% max-w-480px text-left p-10px">
        <div class="text-2xl text-blue-500 font-bold">欢迎登录长护系统</div>
        <div class="text-sm text-gray-500">专业的长期护理评估与管理平台</div>
        <el-form
          class="mt-20px"
          :model="states.form"
          ref="formRef"
          :rules="states.rules"
        >
          <el-form-item prop="username">
            <el-input
              :prefix-icon="User"
              v-model="states.form.username"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              :prefix-icon="Lock"
              v-model="states.form.password"
              type="password"
              placeholder="请输入密码"
            />
          </el-form-item>
          <el-form-item prop="code">
            <div class="flex items-center w-100%">
              <el-input
                class="flex-1"
                :prefix-icon="CreditCard"
                v-model="states.form.code"
                placeholder="请输入验证码"
              />
              <img
                class="w-100px h-30px ml-10px"
                :src="states.captchaUrl"
                alt="验证码"
                @click="refreshCaptcha"
                @error="handleCaptchaError"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" class="w-100%"
              >登录</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import {
  ElMessage,
  ElForm,
  ElInput,
  ElButton,
  ElFormItem,
  type FormInstance,
} from "element-plus";
import { User, Lock, CreditCard } from "@element-plus/icons-vue";
import { http } from "@/lib/http";
const formRef = ref<FormInstance>();
const states = reactive({
  form: {
    username: "",
    password: "",
    code: "",
  },
  rules: {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  },
  captchaUrl: "",
});
const refreshCaptcha = () => {
  states.form.code = "";
  http.get("/auth/captcha").then((res) => {
    states.captchaUrl = URL.createObjectURL(res.data);
  });
};
const handleLogin = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      http.post("/auth/login", states.form).then((res) => {
        console.log(res);
        if (res.code === 200) {
          ElMessage.success(res.message);
        } else {
          ElMessage.error(res.message);
        }
      });
      console.log("登录信息:", states.form);
    }
  });
};
const handleCaptchaError = () => {
  console.log("验证码加载失败");
};
onMounted(() => {
  refreshCaptcha();
});
</script>
<style scoped lang="scss">
.banner {
  background-image: url("/assets/images/login-cover.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(37, 99, 235, 0.6);
  }
}
</style>