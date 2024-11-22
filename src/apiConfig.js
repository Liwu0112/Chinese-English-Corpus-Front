//apiConfig.js

// const baseUrlA = 'http://localhost:8090/admin';
const baseUrlB = 'http://localhost:8090/common';
const baseUrlC = 'http://localhost:8090/regularuser';

const apiEndpoints ={
    login:`${baseUrlB}/login`,  //用户登录
    logout:`${baseUrlB}/logout`,  //用户退出
    regularuserenroll:`${baseUrlC}/enroll`,
}


export default apiEndpoints;
