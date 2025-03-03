const baseUrlA = 'http://corpus.liwusix.top:8090/admin';
const baseUrlB = 'http://corpus.liwusix.top:8090/common'
const baseUrlC = 'http://corpus.liwusix.top:8090/regularuser';

const apiEndpoints = {
    login: `${baseUrlB}/login`,  //登录接口
    logout: `${baseUrlB}/logout`,   //退出接口
    updateusername: `${baseUrlB}/updateusername`,  //修改用户名接口
    updatepassword: `${baseUrlB}/updatepassword`,  //修改密码接口
    selectkindsname: `${baseUrlB}/selectallkind`,  //普通用户查看所有种类名
    selecttnbykn: `${baseUrlB}/selectalltype`,       //普通用户查看每个种类下的所有分类
    reselectcountcorpus: `${baseUrlB}/selectallonlinecount`, //查看库中所有状态为上线(corpus_status=1)的语料总数
    reselectcountkind: `${baseUrlB}/selectallkindcount`,  //查看所有种类数（t_kind)
    reselectcounttype: `${baseUrlB}/selectalltypecount`,  //查看所有分类数（t_type)
    rescorpusbykindname: `${baseUrlB}/selectonlinebykindname`,//普通用户查询种类下对应的所有状态为1的语料总数
    selectallonlinecount: `${baseUrlB}/selectallonlinecount`,
    getcorpusexcel: `${baseUrlC}/getdata`,
    selectallkindcount: `${baseUrlB}/selectallkindcount`,   //管理员查询种类总数

    selectalltypecount: `${baseUrlB}/selectalltypecount`,   //管理员查询分类总数

    selectonlinebykindname: `${baseUrlB}/selectonlinebykindname`, //查询当前种类中语料上线数
    selectallkind: `${baseUrlB}/selectallkind`,  //管理员查看所有种类
    selectalltype: `${baseUrlB}/selectalltype`, //管理员根据种类名查分类
    // 普通用户
    regularenroll: `${baseUrlC}/enroll`,    //普通用户注册接口
    translationtext: `${baseUrlC}/translationbytext`,   //普通用户语料查询接口
    selecttypecorpus: `${baseUrlC}/selecttypecorpus`, //普通用户查看所属分类下的所有语料
    reselectallcorpus: `${baseUrlC}/selectallcorpus`, //普通用户搜索所有上线语料内容
    //管理员
    selectallcorscount: `${baseUrlA}/selectallcorscount`,   //管理员查询语料总数
    selectKindcors: `${baseUrlA}/selectKindcors`,   //查看种类下语料数
    selectofflinebykindname: `${baseUrlA}/selectofflinebykindname`, //查询当前种类中语料下线数
    selectreusercount: `${baseUrlA}/selectreusercount`,  //用户总数
    selectallcors: `${baseUrlA}/selectallcors`,   //所有语料
    updatecorpus: `${baseUrlA}/updatecorpus`,//管理员修改语料
    deleteCorpus: `${baseUrlA}/deletecorpus`, //管理员删除语料
    insertonecorpus: `${baseUrlA}/insertonecorpus`, //新增单个语料
    insertmorecorpus: `${baseUrlA}/insertmorecorpus`, //批量新增按钮
    downloadTemplate: `${baseUrlA}/downloadTemplate`, //下载模板文件
    selectalltypes:`${baseUrlA}/selectalltypes`, //查看所有分类
    updatetype:`${baseUrlA}/updatetype`, //修改分类信息
    deletetype:`${baseUrlA}/deletetype`,  //删除分类
    inserttype:`${baseUrlA}/inserttype`, //新增分类
    selectallreuserinfo:`${baseUrlA}/selectallreuserinfo`,
    updateuserrole:`${baseUrlA}/updateuserrole`, //将普通用户设置为管理员
    resetpassword:`${baseUrlA}/resetpassword`,  //重置密码
    deleteuser:`${baseUrlA}/deleteuser`,    //删除用户
    selectallofflinecount: `${baseUrlA}/selectallofflinecount`,
}

export default apiEndpoints;
