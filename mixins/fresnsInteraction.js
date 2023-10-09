/*!
 * Fresns 微信小程序 (https://fresns.cn)
 * Copyright 2021-Present 唐杰
 * Licensed under the Apache-2.0 license
 */
import { fresnsApi } from '../api/api';
import { globalInfo } from '../utils/fresnsGlobalInfo';
import { getCurrentPagePath, dfs, callPrevPageFunction } from '../utils/fresnsUtilities';

module.exports = {
  /** 右上角菜单-发送给朋友 **/
  onShareAppMessage: async function (res) {
    console.log('onShareAppMessage res', res);

    const currentPagePath = getCurrentPagePath();
    let type = '';
    let fsid = '';

    let shareTitle = this.data.title;
    let sharePath = currentPagePath;

    if (res.from == 'button') {
      type = res.target.dataset.type;
      fsid = res.target.dataset.fsid;

      shareTitle = res.target.dataset.title;
    }

    if (res.from == 'menu') {
      switch (currentPagePath) {
        case 'pages/groups/detail':
          type = 'group';
          fsid = this.data.group.gid;
          sharePath = '/pages/groups/detail?gid=' + fsid;
          break;

        case 'pages/hashtags/detail':
          type = 'hashtag';
          fsid = this.data.hashtag.hid;
          sharePath = '/pages/hashtags/detail?hid=' + fsid;
          break;

        case 'pages/posts/detail':
          type = 'post';
          fsid = this.data.post.pid;
          sharePath = '/pages/posts/detail?pid=' + fsid;
          break;

        case 'pages/comments/detail':
          type = 'comment';
          fsid = this.data.comment.cid;
          sharePath = '/pages/comments/detail?cid=' + fsid;
          break;

        default:
          if (currentPagePath.startsWith('pages/profile')) {
            const userHomePath = await globalInfo.userHomePath();
            type = 'user';
            fsid = this.data.profile.detail.fsid;
            sharePath = userHomePath + fsid;
          }
      }
    }

    switch (type) {
      case 'user':
        const userHomePath = await globalInfo.userHomePath();
        sharePath = userHomePath + fsid;
        break;

      case 'group':
        sharePath = '/pages/groups/detail?gid=' + fsid;
        break;

      case 'hashtag':
        sharePath = '/pages/hashtags/detail?hid=' + fsid;
        break;

      case 'post':
        sharePath = '/pages/posts/detail?pid=' + fsid;
        break;

      case 'comment':
        sharePath = '/pages/comments/detail?cid=' + fsid;
        break;

      default:
      // code
    }

    console.log('onShareAppMessage return', shareTitle, sharePath);

    return {
      title: shareTitle,
      path: sharePath,
    };
  },

  /** 右上角菜单-分享到朋友圈 **/
  onShareTimeline: function () {
    const currentPagePath = getCurrentPagePath();

    let shareQuery = '';

    switch (currentPagePath) {
      case 'pages/groups/detail':
        shareQuery = 'gid=' + this.data.group.gid;
        break;

      case 'pages/hashtags/detail':
        shareQuery = 'hid=' + this.data.hashtag.hid;
        break;

      case 'pages/posts/detail':
        shareQuery = 'pid=' + this.data.post.pid;
        break;

      case 'pages/comments/detail':
        shareQuery = 'cid=' + this.data.comment.cid;
        break;

      default:
        if (currentPagePath.startsWith('pages/profile')) {
          shareQuery = 'fsid=' + this.data.profile.detail.fsid;
        }
    }

    console.log('onShareTimeline', shareQuery);

    return {
      title: this.data.title,
      query: shareQuery,
    };
  },

  /** 右上角菜单-收藏 **/
  onAddToFavorites: function () {
    const currentPagePath = getCurrentPagePath();

    let shareQuery = '';

    switch (currentPagePath) {
      case 'pages/groups/detail':
        shareQuery = 'gid=' + this.data.group.gid;
        break;

      case 'pages/hashtags/detail':
        shareQuery = 'hid=' + this.data.hashtag.hid;
        break;

      case 'pages/posts/detail':
        shareQuery = 'pid=' + this.data.post.pid;
        break;

      case 'pages/comments/detail':
        shareQuery = 'cid=' + this.data.comment.cid;
        break;

      default:
        if (currentPagePath.startsWith('pages/profile')) {
          shareQuery = 'fsid=' + this.data.profile.detail.fsid;
        }
    }

    console.log('onAddToFavorites', shareQuery);

    return {
      title: this.data.title,
      query: shareQuery,
    };
  },

  /** 生成分享海报 **/
  onSharePoster: async function (type, fsid) {
    wx.showLoading();

    const resultRes = await fresnsApi.plugins.sharePoster.generate({
      type: type,
      fsid: fsid,
    });

    if (resultRes.code != 0) {
      wx.hideLoading();

      return;
    }

    wx.downloadFile({
      url: resultRes.data.url,
      success: function (res) {
        wx.hideLoading();

        wx.showShareImageMenu({
          path: res.tempFilePath
        })
      }
    })
  },

  /** 添加用户 **/
  onAddUser(newUser) {
    const users = this.data.users;

    if (!users) {
      return;
    }

    users.unshift(newUser);

    this.setData({
      users: users,
    });
  },

  /** 添加小组 **/
  onAddGroup(newGroup) {
    const groups = this.data.groups;

    if (!groups) {
      return;
    }

    groups.unshift(newGroup);

    this.setData({
      groups: groups,
    });
  },

  /** 添加话题 **/
  onAddHashtag(newHashtag) {
    const hashtags = this.data.hashtags;

    if (!hashtags) {
      return;
    }

    hashtags.unshift(newHashtag);

    this.setData({
      hashtags: hashtags,
    });
  },

  /** 添加帖子 **/
  onAddPost(newPost) {
    const posts = this.data.posts;

    if (!posts) {
      return;
    }

    posts.unshift(newPost);

    this.setData({
      posts: posts,
    });
  },

  /** 添加评论 **/
  onAddComment(newComment) {
    const comments = this.data.comments;

    if (!comments) {
      return;
    }

    comments.unshift(newComment);

    this.setData({
      comments: comments,
    });
  },

  /** 更改用户 **/
  onChangeUser(newUser) {
    // 详情页
    const user = this.data?.profile?.detail;

    if (user) {
      if (user.uid != newUser.uid) {
        return;
      }

      const profile = this.data.profile;
      profile.detail = newUser;

      this.setData({
        profile: profile,
      });

      // 同步更改上一页用户
      callPrevPageFunction('onChangeUser', newUser);

      return;
    }

    // 列表页
    const users = this.data.users;
    if (!users) {
      return;
    }

    const idx = users.findIndex((value) => value.uid == newUser.uid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    users[idx] = newUser;

    this.setData({
      users: users,
    });
  },

  /** 更改小组 **/
  onChangeGroup(newGroup) {
    // 详情页
    const group = this.data.group;

    if (group) {
      if (group.gid != newGroup.gid) {
        return;
      }

      this.setData({
        group: newGroup,
      });

      // 同步更改上一页小组
      callPrevPageFunction('onChangeGroup', newGroup);

      return;
    }

    // 列表页
    const groups = this.data.groups;
    if (!groups) {
      return;
    }

    const idx = groups.findIndex((value) => value.gid == newGroup.gid);

    if (idx !== -1) {
      // 找到了小组
      groups[idx] = newGroup;

      this.setData({
        groups: groups,
      });

      return;
    }

    // 树结构页
    const groupTree = this.data.groupTree;
    if (!groupTree) {
      return;
    }

    const newGroupTree = groupTree.map((tree) => dfs(tree, newGroup.gid, newGroup));

    this.setData({
      groupTree: newGroupTree,
    });
  },

  /** 更改话题 **/
  onChangeHashtag(newHashtag) {
    // 详情页
    const hashtag = this.data.hashtag;

    if (hashtag) {
      if (hashtag.hid != newHashtag.hid) {
        return;
      }

      this.setData({
        hashtag: newHashtag,
      });

      // 同步更改上一页话题
      callPrevPageFunction('onChangeHashtag', newHashtag);

      return;
    }

    // 列表页
    const hashtags = this.data.hashtags;
    if (!hashtags) {
      return;
    }

    const idx = hashtags.findIndex((value) => value.hid == newHashtag.hid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    hashtags[idx] = newHashtag;

    this.setData({
      hashtags: hashtags,
    });
  },

  /** 更改帖子 **/
  onChangePost(newPost) {
    // 详情页
    const post = this.data.post;

    if (post) {
      if (post.pid != newPost.pid) {
        return;
      }

      this.setData({
        post: newPost,
      });

      // 同步更改上一页帖子
      callPrevPageFunction('onChangePost', newPost);

      return;
    }

    // 列表页
    const posts = this.data.posts;
    if (!posts) {
      return;
    }

    const idx = posts.findIndex((value) => value.pid == newPost.pid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    posts[idx] = newPost;

    this.setData({
      posts: posts,
    });
  },

  /** 更改评论 **/
  onChangeComment(newComment) {
    // 详情页
    const comment = this.data.comment;

    if (comment) {
      if (comment.cid != newComment.cid) {
        return;
      }

      this.setData({
        comment: newComment,
      });

      // 同步更改上一页评论
      callPrevPageFunction('onChangeComment', newComment);

      return;
    }

    // 列表页
    const comments = this.data.comments;
    if (!comments) {
      return;
    }

    const idx = comments.findIndex((value) => value.cid == newComment.cid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    comments[idx] = newComment;

    this.setData({
      comments: comments,
    });
  },

  /** 移除用户 **/
  onRemoveUser(removeUid) {
    // 详情页
    const user = this.data?.profile?.detail;

    if (user) {
      if (user.uid != removeUid) {
        return;
      }

      // 移除上一页用户
      callPrevPageFunction('onRemoveUser', removeUid);

      // 后退上一页
      wx.navigateBack();

      return;
    }

    // 列表页
    const users = this.data.users;
    if (!users) {
      return;
    }

    const idx = users.findIndex((value) => value.uid == removeUid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    users.splice(idx, 1);

    this.setData({
      users: users,
    });
  },

  /** 移除小组 **/
  onRemoveGroup(removeGid) {
    // 详情页
    const group = this.data.group;

    if (group) {
      if (group.gid != removeGid) {
        return;
      }

      // 移除上一页小组
      callPrevPageFunction('onRemoveGroup', removeGid);

      // 后退上一页
      wx.navigateBack();

      return;
    }

    // 列表页
    const groups = this.data.groups;
    if (!groups) {
      return;
    }

    const idx = groups.findIndex((value) => value.gid == removeGid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    groups.splice(idx, 1);

    this.setData({
      groups: groups,
    });
  },

  /** 移除话题 **/
  onRemoveHashtag(removeHid) {
    // 详情页
    const hashtag = this.data.hashtag;

    if (hashtag) {
      if (hashtag.hid != removeHid) {
        return;
      }

      // 移除上一页话题
      callPrevPageFunction('onRemoveHashtag', removeHid);

      // 后退上一页
      wx.navigateBack();

      return;
    }

    // 列表页
    const hashtags = this.data.hashtags;
    if (!hashtags) {
      return;
    }

    const idx = hashtags.findIndex((value) => value.hid == removeHid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    hashtags.splice(idx, 1);

    this.setData({
      hashtags: hashtags,
    });
  },

  /** 移除帖子 **/
  onRemovePost(removePid) {
    // 详情页
    const post = this.data.post;

    if (post) {
      if (post.pid != removePid) {
        return;
      }

      // 移除上一页帖子
      callPrevPageFunction('onRemovePost', removePid);

      // 后退上一页
      wx.navigateBack();

      return;
    }

    // 列表页
    const posts = this.data.posts;
    if (!posts) {
      return;
    }

    const idx = posts.findIndex((value) => value.pid == removePid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    posts.splice(idx, 1);

    this.setData({
      posts: posts,
    });
  },

  /** 移除评论 **/
  onRemoveComment(removeCid) {
    // 详情页
    const comment = this.data.comment;

    if (comment) {
      if (comment.cid != removeCid) {
        return;
      }

      // 移除上一页评论
      callPrevPageFunction('onRemoveComment', removeCid);

      // 后退上一页
      wx.navigateBack();

      return;
    }

    // 列表页
    const comments = this.data.comments;
    if (!comments) {
      return;
    }

    const idx = comments.findIndex((value) => value.cid == removeCid);

    if (idx == -1) {
      // 未找到记录
      return;
    }

    comments.splice(idx, 1);

    this.setData({
      comments: comments,
    });
  },

  /** 删除帖子 **/
  onDeletePost: async function (deletePid) {
    const resultRes = await fresnsApi.post.postDelete({
      pid: deletePid,
    });

    if (resultRes.code === 0) {
      this.onRemovePost(deletePid);
    }
  },

  /** 删除评论 **/
  onDeleteComment: async function (deleteCid) {
    const resultRes = await fresnsApi.comment.commentDelete({
      cid: deleteCid,
    });

    if (resultRes.code === 0) {
      this.onRemoveComment(deleteCid);
    }
  },

  /** 发表评论 **/
  onPublishCommentAction: async function (data) {
    const commentPid = data.commentPid;
    const commentCid = data.commentCid;
    const newCid = data.newCid;

    // 帖子的评论总数 +1
    if (commentPid) {
      // 详情页
      const postDetail = this.data.post;
      if (postDetail) {
        postDetail.commentCount = postDetail.commentCount + 1;

        this.setData({
          post: postDetail,
        });
      }

      // 列表页
      const posts = this.data.posts;
      if (posts) {
        const postIdx = posts.findIndex((value) => value.pid == commentPid);

        if (postIdx >= 0) {
          posts[postIdx].commentCount = posts[postIdx].commentCount + 1;

          this.setData({
            posts: posts,
          });
        }
      }
    }

    const comments = this.data.comments;
    if (comments) {
      // 涉及父级评论，父级评论总数 +1
      if (commentCid) {
        const commentIdx = comments.findIndex((value) => value.cid == commentCid);

        if (commentIdx >= 0) {
          comments[commentIdx].commentCount = comments[commentIdx].commentCount + 1;
        }
      }

      const currentPagePath = getCurrentPagePath();
      if (currentPagePath == 'pages/posts/detail' && commentCid) {
        // 重置评论列表
        this.setData({
          comments: comments,
        });

        return;
      }

      // 发表成功，插入新评论
      const commentDetailRes = await fresnsApi.comment.commentDetail({
        cid: newCid,
      });

      if (commentDetailRes.code === 0) {
        let detail = commentDetailRes.data.detail;
        detail.replyToPost = {
          pid: detail.replyToPost.pid,
        };

        comments.unshift(detail);
      }

      // 重置评论列表
      this.setData({
        comments: comments,
      });
    }
  },
};
