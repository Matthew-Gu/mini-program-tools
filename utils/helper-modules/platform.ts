/** 获取对应标签矩形区域信息 */
export function getNodeRect(selector: string, context: any) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery()
      .in(context)
      .select(selector)
      .boundingClientRect((rect) => {
        if (rect) {
          resolve({
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
          });
        }
        reject(new Error("未找到指定的选择器"));
      })
      .exec();
  });
}

/** 保存图片 */
export function saveImage(imagePath: string) {
  wx.showLoading({ title: "保存中", mask: true });

  // 判断是否是网络图片
  const isNetworkImage = /^https?:\/\//.test(imagePath);

  const save = (filePath: string) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.hideLoading();
        wx.showToast({ title: "保存成功", icon: "success" });
      },
      fail: (err) => {
        wx.hideLoading();
        const msg = err.errMsg || "";
        if (
          msg.includes("auth deny") ||
          msg.includes("auth denied") ||
          msg.includes("authorize no response")
        ) {
          wx.showModal({
            title: "提示",
            content: "需要您授权保存相册",
            showCancel: false,
            success: () => {
              wx.openSetting({
                success(settingData) {
                  if (settingData.authSetting["scope.writePhotosAlbum"]) {
                    save(filePath); // 重新保存
                  } else {
                    wx.showToast({
                      title: "授权失败，请稍后重新获取",
                      icon: "none",
                      duration: 1500,
                    });
                  }
                },
              });
            },
          });
        } else {
          wx.showToast({ title: "保存失败", icon: "none" });
        }
      },
    });
  };

  if (isNetworkImage) {
    // 下载网络图片
    wx.downloadFile({
      url: imagePath,
      success(res) {
        if (res.statusCode === 200) {
          save(res.tempFilePath);
        } else {
          wx.hideLoading();
          wx.showToast({ title: "下载失败", icon: "none" });
        }
      },
      fail() {
        wx.hideLoading();
        wx.showToast({ title: "下载失败", icon: "none" });
      },
    });
  } else {
    // 本地路径直接保存
    save(imagePath);
  }
}

/** 检测更新 */
export function checkUpdate() {
  const updateManager = wx.getUpdateManager();
  updateManager.onCheckForUpdate((res) => {
    if (res.hasUpdate) {
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: "更新提示",
          content: "新版本已经准备好，是否重启应用？",
          success: (res) => {
            if (res.confirm) {
              // 新版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          },
        });
      });
      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: "更新提示",
          content: "新版本已上线，请删除当前小程序后重新打开",
          showCancel: false,
          confirmText: "知道了",
        });
      });
    }
  });
}
