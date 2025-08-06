import { defineStore } from "pinia";
import Cookies from 'js-cookie'
const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "",
    userInfo: {},
    isLogin: false,
  }),
  getters: {
    isAuthenticated: (state) => state.isLogin,
    currentUser: (state) => state.userInfo,
    currentToken: (state) => state.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      Cookies.set("long-term-care-token", token);
    },
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
    },
    decodeJwt(token: string) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        this.userInfo = JSON.parse(jsonPayload);
      } catch (error) {
        console.error('JWT解码失败:', error);
        return null;
      }
      // 
    },
    login(token: string) {
      this.setToken(token);
      this.decodeJwt(token);
    },
    logout() {
      this.setToken("");
      this.setUserInfo({});
    },
  }
});
export default useAuthStore;