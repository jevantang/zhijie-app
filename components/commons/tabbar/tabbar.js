/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsAuth, fresnsOverview } from '../../../sdk/helpers/profiles';

Component({
  /** 组件的属性列表 **/
  properties: {
    activeLabel: {
      type: String,
      value: 'portal',
    },
  },

  /** 组件的初始数据 **/
  data: {
    messages: 0,
  },

  /** 组件生命周期声明对象 **/
  lifetimes: {
    attached: async function () {
      // 获取登录用户的未读消息数
      if (fresnsAuth.userLogin) {
        const unreadNotifications = await fresnsOverview('unreadNotifications.all');
        const unreadMessages = await fresnsOverview('conversations.unreadMessages');

        this.setData({
          messages: unreadNotifications,
        });
      }
    },
  },

  /** 组件功能 **/
  methods: {
    goTabPage(e) {
      const pagePath = e.currentTarget.dataset.pagePath;

      if (pagePath == '/pages/editor/index') {
        wx.navigateTo({
          url: pagePath,
        });

        return;
      }

      wx.reLaunch({
        url: pagePath,
      });
    },

    // 修改通知消息数
    onChangeUnreadNotifications: function () {
      console.log('onChangeUnreadNotifications tabbar');

      const messages = this.data.messages;

      this.setData({
        messages: messages - 1,
      });
    },

    // 修改私信消息数
    onChangeUnreadMessages: function (count = 1) {
      console.log('onChangeUnreadMessages tabbar', count);

      const messages = this.data.messages;

      this.setData({
        messages: messages - count,
      });
    },
  },
});
