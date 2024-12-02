const baseUrlA ='http://localhost:8090/admin';
const baseUrlB = 'http://localhost:8090/common';
const baseUrlC = 'http://localhost:8090/regularuser';

const apiEndpoints = {
    login: `${baseUrlB}/login`,  //登录接口
    logout: `${baseUrlB}/logout`,   //退出接口


    // 普通用户
    regularenroll: `${baseUrlC}/enroll`,    //普通用户注册接口
    translationtext: `${baseUrlC}/translationbytext`,   //普通用户语料查询接口
    updateusername: `${baseUrlB}/updateusername`,  //修改用户名接口
    updatepassword: `${baseUrlB}/updatepassword`,  //修改密码接口
    selectkindsname : `${baseUrlC}/selectallkindname`,  //普通用户查看所有种类名
    selecttnbykn: `${baseUrlC}/selecttnbykn`,       //普通用户查看每个种类下的所有分类
    selecttypecorpus: `${baseUrlC}/selecttypecorpus`, //普通用户查看所属分类下的所有语料
    reselectcountcorpus: `${baseUrlC}/reselectcountcorpus`, //查看库中所有状态为上线(corpus_status=1)的语料总数
    reselectcountkind: `${baseUrlC}/reselectcountkind`,  //查看所有种类数（t_kind)
    reselectcounttype: `${baseUrlC}/reselectcounttype`,  //查看所有分类数（t_type)
    rescorpusbykindname: `${baseUrlC}/rescorpusbykindname`,//普通用户查询种类下对应的所有状态为1的语料总数



    //管理员
    selectallcors: `${baseUrlA}/selectallcors`,   //管理员查询语料总数
    selectallkind: `${baseUrlA}/selectallkind`,   //管理员查询种类总数
    selectalltype: `${baseUrlA}/selectalltype`,   //管理员查询分类总数
    selectallonlinecors: `${baseUrlA}/selectallonlinecors`, //管理员查询上线数
    selectallline: `${baseUrlA}/selectallline`,   //管理员查看下线数
    selectKindcors: `${baseUrlA}/selectKindcors`,
    selectonlinebykindname: `${baseUrlA}/selectonlinebykindname`, //查询当前种类中语料上线数
    selectofflinebykindname: `${baseUrlA}/selectofflinebykindname`, //查询当前种类中语料上线数
    selectreusercount: `${baseUrlA}/selectreusercount`,


}

export default apiEndpoints;
