import { UserService } from "@/services";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
   name: "",
   checked: false,
  }),
  getters: {
    getName: (state) => state.name,
    isAuthenticated: (state) => state.name !== "",
  },
  actions: {
    setUserName(name: string) {
      this.name = name;
    },
     setisAuthenticated(state: boolean) {
      this.checked = state;
    },
    logoutUser() {
      this.name = "";
      this.checked = true;
    },
    async fetchAuthState() {
      try {
        await UserService.getCsrf();
        const res = await UserService.user();
        this.name = res.data.name;
      } catch (_) { } finally {
        this.checked = true;
      }
    },
  },
});
