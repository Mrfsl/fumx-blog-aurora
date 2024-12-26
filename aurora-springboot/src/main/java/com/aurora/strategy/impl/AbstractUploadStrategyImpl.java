package com.aurora.strategy.impl;

import com.aurora.exception.BizException;
import com.aurora.strategy.UploadStrategy;
import com.aurora.util.FileUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;

@Service
public abstract class AbstractUploadStrategyImpl implements UploadStrategy {

    @Override
    public String uploadFile(MultipartFile file, String path) {
        // 墨染
        // 将路径与桶重复的 ‘aurora/’ 去掉
        String upPath = path;
        upPath = upPath.replaceAll("aurora/","");     // articles/xx.jpg

        try {
            String md5 = FileUtil.getMd5(file.getInputStream());
            String extName = FileUtil.getExtName(file.getOriginalFilename());
            String fileName = md5 + extName;
            if (!exists(upPath + fileName)) {
                upload(upPath, fileName, file.getInputStream());
            }
            return getFileAccessUrl(path + fileName);    //  aurora/articles/xx.jpg  用于预览链接
        } catch (Exception e) {
            e.printStackTrace();
            throw new BizException("文件上传失败");
        }
    }

    @Override
    public String uploadFile(String fileName, InputStream inputStream, String path) {
        try {
            upload(path, fileName, inputStream);
            return getFileAccessUrl(path + fileName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new BizException("文件上传失败");
        }
    }

    public abstract Boolean exists(String filePath);

    public abstract void upload(String path, String fileName, InputStream inputStream) throws IOException;

    public abstract String getFileAccessUrl(String filePath);

}
