import { defineStore } from 'pinia'

export const useMetaStore = defineStore('metaStore', {
  state: () => {
    return {
      title: '墨染的个人博客'      // 网页的title
    }
  }
})
