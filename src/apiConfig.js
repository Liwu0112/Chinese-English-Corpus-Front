const baseUrlB = 'http://localhost:8090/common';
const baseUrlC = 'http://localhost:8090/regularuser';

const apiEndpoints = {
    login: `${baseUrlB}/login`,  //登录接口
    logout: `${baseUrlB}/logout`,   //退出接口
    regularenroll: `${baseUrlC}/enroll`,    //普通用户注册接口
    translationtext: `${baseUrlC}/translationbytext`,   //普通用户语料查询接口
}

export default apiEndpoints;
