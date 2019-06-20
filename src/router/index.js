import Vue from 'vue'
import Router from 'vue-router'
import guard from './guard'

import Home from '@v/Home/Home'
import Login from '@v/Login/Login'
import Register from '@v/Login/Register'

import localStorage from '@u/localStorage'

Vue.use(Router)

const r = {
  ResetPassword: () => import('@v/Login/Reset'),

  sub: {
    BeforeCheckPsd: () => import('@v/sub/BeforeCheckPsd'),
    CreatePlanHint: () => import('@v/sub/CreatePlanHint')
  },

  My: {
    Index: () => import('@v/My/Index'),
    Info: () => import('@v/My/Info'),

    Account: {
      Index: () => import('@v/My/Account/Index'),
      ChangePsd: () => import('@v/My/Account/ChangePsd'),
      ChangePhone: () => import('@v/My/Account/ChangePhone'),
    },

    Feedback: () => import('@v/My/Feedback')
  },

  Health: {
    Health: () => import('@v/Health/Health'),
    AddIll: () => import('@v/Health/AddIll'),
    
    IllInfo: {
      Index: () => import('@v/Health/IllInfo/Index'),
      Medicinal: () => import('@v/Health/IllInfo/Medicinal'),
      Other: () => import('@v/Health/IllInfo/Other'),
      Wen_Juan: () => import('@v/Health/IllInfo/WenJuan'),
      CreatingPlan: () => import('@v/Health/IllInfo/CreatingPlan')
    },
  },

  LearningPlan: {
    LearningPlan: () => import('@v/LearningPlan/LearningPlan'),

    Article: {
      Article: () => import('@v/LearningPlan/Article/Article'),
      Test: () => import('@v/LearningPlan/Article/Test'),
      Feedback: () => import('@v/LearningPlan/Article/Feedback'),
      Analysis: () => import('@v/LearningPlan/Article/Analysis'),
      Exam: () => import('@v/LearningPlan/Article/exam')
    }
  },
  FamilyTest: {
    Index: () => import('@v/FamilyTest/Index'),

    XTMB: {     // 血糖目标
      XTMB: () => import('@v/FamilyTest/XTMB/XTMB'),
      Change_Fen_Xing: () => import('@v/FamilyTest/XTMB/ChangeFenXing'),
    },

    XT: {       // 血糖
      XT: () => import('@v/FamilyTest/XT/XT'),
      CollectXT: () => import('@v/FamilyTest/XT/CollectXT')
    },

    Weight: () => import('@v/FamilyTest/Weight')   
  },

  FollowDoctors: {
    FollowDoctors: () => import('@v/FollowDoctors/FollowDoctors'),
    Search: () => import('@v/FollowDoctors/Search'),
    SearchByHosp: () => import('@v/FollowDoctors/SearchByHosp'),
    DoctorInfo: () => import('@v/FollowDoctors/DoctorInfo')
  },

  Relative: {
    Relative: () => import('@v/Relative/Relative')
  },

  RoleManagement: {
    Index: () => import('@v/RoleManagement/Index'),
    ApplyList: () => import('@v/RoleManagement/ApplyList')
  },

  AllQA: {
    AllQA: () => import('@v/AllQA/AllQA'),
    QAInfo: () => import('@v/AllQA/QAInfo')
  },

  CollectionQA: {
    CollectionQA: () => import('@v/CollectionQA/CollectionQA'),
  },

  OpenQA: {
    OpenQA: () => import('@v/OpenQA/OpenQA'),
    AllIll: () => import('@v/OpenQA/AllIll'),

    QAInfo: {
      QAInfo: () => import('@v/OpenQA/QAInfo/QAInfo'),
      AnswerInfo: () => import('@v/OpenQA/QAInfo/AnswerInfo'),
      CommentEditor: () => import('@v/OpenQA/QAInfo/CommentEditor')
    },

    Question: {
      Question: () => import('@v/OpenQA/Question/Question'),
      Questioned: () => import('@v/OpenQA/Question/Questioned')
    },
  },

  MyQuestion: {
    MyQuestion: () => import('@v/MyQuestion/MyQuestion')
  }
}

const keepAlive = true,
fromUrlStop = true

// 设置路由path和name
function p(name, path){
  return {
    path: `/${path ? path : name}`,
    name,
    meta: {}  // 防止未设置meta造成取到undefined的情况
  }
}

var routes = [
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: {
      keepAlive
    }
  }, {  // 公用前置验证密码页面
    ...p('sub/before_check_psd'),
    component: r.sub.BeforeCheckPsd,
    meta: {
      fromUrlStop
    }
  }, {  // 用户引导页
    ...p('sub/create_plan_hint'),
    component: r.sub.CreatePlanHint
  }, {  // 登录
    ...p('login'),
    component: Login,
    beforeEnter: (to, from, next) => {
      if(localStorage.get('isLogin', false) && from.name){ next({ name: 'home' }) }
      else{ next() }
    }
  }, {  // 注册
    ...p('register'),
    component: Register
  }, {  // 重置密码
    ...p('reset_psd'),
    component: r.ResetPassword
  }, {  // 我的
    ...p('my'),
    component: r.My.Index
  }, {  // 我的/个人信息
    ...p('my/info'),
    component: r.My.Info,
  }, {  // 我的/帐号管理
    ...p('my/account'),
    component: r.My.Account.Index
  }, {  // 我的/帐号管理/修改密码
    ...p('my/account/change_psd'),
    component: r.My.Account.ChangePsd,
    meta: {
      fromUrlStop
    }
  }, {  // 我的/帐号管理/修改手机号
    ...p('my/account/change_phone'),
    component: r.My.Account.ChangePhone,
    meta: {
      fromUrlStop
    }
  }, {  // 我的/反馈
    ...p('my/feedback'),
    component: r.My.Feedback
  }, {  // 基本病情
    ...p('health'),
    component: r.Health.Health
  }, {  // 基本病情/添加疾病
    ...p('health/add_ill'),
    component: r.Health.AddIll,
    meta: {
      fromUrlStop
    }
  }, {  // 基本病情/疾病详情
    ...p('health/ill_info/index'),
    component: r.Health.IllInfo.Index,
    meta: {
      keepAlive,
      fromUrlStop
    }
  }, {  // 基本病情/疾病详情/当前用药
    ...p('health/ill_info/medicinal'),
    component: r.Health.IllInfo.Medicinal,
    meta: {
      fromUrlStop
    }
  }, {  // 基本病情/疾病详情/其他（除当前用药以外的其他模块）
    ...p('health/ill_info/other'),
    component: r.Health.IllInfo.Other,
    meta: {
      fromUrlStop
    }
  }, {  // 基本病情/疾病详情/问卷
    ...p('health/ill_info/wen_juan'),
    component: r.Health.IllInfo.Wen_Juan,
    meta: {
      fromUrlStop
    }
  }, {  // 疾病详情/疾病详情/生成计划中
    ...p('health/ill_info/creating_plan'),
    component: r.Health.IllInfo.CreatingPlan,
    meta: {
      fromUrlStop
    }
  }, {  // 学习计划
    ...p('learning_plan'),
    component: r.LearningPlan.LearningPlan,
  }, {  // 学习计划/文章详情
    ...p('learning_plan/article'),
    component: r.LearningPlan.Article.Article,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {  // 学习计划/文章考核
    ...p('learning_plan/test'),
    component: r.LearningPlan.Article.Test,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {  // 学习计划/反馈
    ...p('learning_plan/feedback'),
    component: r.LearningPlan.Article.Feedback,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {  // 学习计划/错题解析
    ...p('learning_plan/analysis'),
    component: r.LearningPlan.Article.Analysis,
    meta: {
      fromUrlStop,
    }
  }, {  // 学习计划/阶段考核
    ...p('learning_plan/exam'),
    component: r.LearningPlan.Article.Exam,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {  // 家庭测试
    ...p('family_test'),
    component: r.FamilyTest.Index
  }, {  // 家庭测试/血糖目标
    ...p('family_test/xtmb'),
    component: r.FamilyTest.XTMB.XTMB
  }, {  // 家庭测试/血糖目标/改变分型
    ...p('family_test/xtmb/change_fen_xing'),
    component: r.FamilyTest.XTMB.Change_Fen_Xing
  }, {  // 家庭测试/血糖
    ...p('family_test/xt'),
    component: r.FamilyTest.XT.XT
  }, {  // 家庭测试/血糖采集
    ...p('family_test/collect_xt'),
    component: r.FamilyTest.XT.CollectXT,
    meta: {
      keepAlive,
      fromUrlStop
    }
  }, {  // 家庭测试/体重
    ...p('family_test/weight'),
    component: r.FamilyTest.Weight
  }, {  // 关注医生
    ...p('follow_doctors'),
    component: r.FollowDoctors.FollowDoctors
  }, {  // 关注医生/搜索
    ...p('follow_doctors/search'),
    component: r.FollowDoctors.Search,
    meta: {
      keepAlive
    }
  }, {  // 关注医生/按医院搜索
    ...p('follow_doctors/search_by_hosp'),
    component: r.FollowDoctors.SearchByHosp,
    meta: {
      keepAlive
    }
  }, {  // 关注医生/医生详情
    ...p('follow_doctors/doctor_info'),
    component: r.FollowDoctors.DoctorInfo
  }, {  // 亲友设定
    ...p('relative'),
    component: r.Relative.Relative
  }, {  // 角色管理
    ...p('role_management'),
    component: r.RoleManagement.Index
  }, {  // 角色管理/申请列表
    ...p('role_management/apply_list'),
    component: r.RoleManagement.ApplyList
  }, {  // 全部问答
    ...p('all_qa'),
    component: r.AllQA.AllQA,
    
    children: [
      {
        ...p('all_qa/qa_info'),
        component: r.AllQA.QAInfo
      }
    ]
  }, {  // 收藏问答
    ...p('collection_qa'),
    component: r.CollectionQA.CollectionQA,

    children: [
      {
        ...p('collection_qa/qa_info'),
        component: r.AllQA.QAInfo
      }
    ]
  }, {  // 公开问答
    ...p('open_qa'),
    component: r.OpenQA.OpenQA,
    meta: {
      keepAlive
    }
  }, {  // 公开问答/提问
    ...p('open_qa/question'),
    component: r.OpenQA.Question.Question,
    meta: {
      keepAlive, fromUrlStop
    }
  }, { // 公开问答/提问成功
    ...p('open_qa/question/questioned'),
    component: r.OpenQA.Question.Questioned
  }, {  // 公开问答/更多疾病
    ...p('open_qa/all_ill'),
    component: r.OpenQA.AllIll,
    meta: {
      keepAlive
    }
  }, {  // 公开提问/问题详情
    ...p('open_qa/qa_info'),
    component: r.OpenQA.QAInfo.QAInfo,
    meta: {
      keepAlive, 
    },

    children: [
      {  // 公开提问/问题详情/回答详情  
        ...p('all_qa/qa_info/answer_info'),
        component: r.OpenQA.QAInfo.AnswerInfo,
        meta: {
          fromUrlStop
        },

        children: [
          {  // 公开提问/问题详情/评论
            ...p('all_qa/qa_info/answer_info/commentEditor'),
            component: r.OpenQA.QAInfo.CommentEditor,
            meta: {
              fromUrlStop
            }
          }
        ]
      }
    ]
  }, {  // 我的提问
    ...p('my_question'),
    component: r.MyQuestion.MyQuestion,
    
    children: [
      { // 我的提问/问题详情
        ...p('my_question/answer_info'),
        component: r.OpenQA.QAInfo.AnswerInfo
      }
    ]
  },
  
  
  { // 输入不存在的路由时，回到home
    path: '*',
    redirect: '/home'
  }
]

// guard为路由实例添加全局守卫
export default guard(new Router({
  mode: 'history',
  base: '/user/h5/vue',
  routes
}))
