import { defineStore } from 'pinia'

export const useMetaStore = defineStore('metaStore', {
  state: () => {
    return {
      title: '墨染的开发之旅'      // 网页的title
    }
  }
})
