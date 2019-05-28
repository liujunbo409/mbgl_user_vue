import Vue from 'vue'
import Router from 'vue-router'
import guard from './guard'

import Home from '@v/Home/Home'
import Login from '@v/Login/Login'
import Register from '@v/Login/Register'


Vue.use(Router)

const r = {
  ResetPassword: () => import('@v/Login/Reset'),
  sub: {
    BeforeCheckPsd: () => import('@v/sub/BeforeCheckPsd')
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
      XT: () => import('@v/FamilyTest/XT/XT')
    }    
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
    path: '/',
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
  }, {  // 登录
    ...p('login'),
    component: Login
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
    meta: {
      keepAlive
    }
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
  }, {
    ...p('health'),
    component: r.Health.Health
  }, {
    ...p('health/add_ill'),
    component: r.Health.AddIll,
    meta: {
      fromUrlStop
    }
  }, {
    ...p('health/ill_info/index'),
    component: r.Health.IllInfo.Index,
    meta: {
      keepAlive,
      fromUrlStop
    }
  }, {
    ...p('health/ill_info/medicinal'),
    component: r.Health.IllInfo.Medicinal,
    meta: {
      fromUrlStop
    }
  }, {
    ...p('health/ill_info/other'),
    component: r.Health.IllInfo.Other,
    meta: {
      fromUrlStop
    }
  }, {
    ...p('health/ill_info/wen_juan'),
    component: r.Health.IllInfo.Wen_Juan,
    meta: {
      fromUrlStop
    }
  }, {
    ...p('health/ill_info/creating_plan'),
    component: r.Health.IllInfo.CreatingPlan,
    meta: {
      fromUrlStop
    }
  }, {
    ...p('learning_plan'),
    component: r.LearningPlan.LearningPlan,
  }, {
    ...p('learning_plan/article'),
    component: r.LearningPlan.Article.Article,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {
    ...p('learning_plan/test'),
    component: r.LearningPlan.Article.Test,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {
    ...p('learning_plan/feedback'),
    component: r.LearningPlan.Article.Feedback,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {
    ...p('learning_plan/analysis'),
    component: r.LearningPlan.Article.Analysis,
    meta: {
      fromUrlStop,
    }
  }, {
    ...p('learning_plan/exam'),
    component: r.LearningPlan.Article.Exam,
    meta: {
      fromUrlStop,
      keepAlive
    }
  }, {
    ...p('family_test'),
    component: r.FamilyTest.Index
  }, {
    ...p('family_test/xtmb'),
    component: r.FamilyTest.XTMB.XTMB
  }, {
    ...p('family_test/xtmb/change_fen_xing'),
    component: r.FamilyTest.XTMB.Change_Fen_Xing
  }, {
    ...p('family_test/xt'),
    component: r.FamilyTest.XT.XT
  }
  
  
  // { // 输入不存在的路由时，回到home
  //   path: '*',
  //   redirect: '/'
  // }
]

// guard为路由实例添加全局守卫
export default guard(new Router({
  mode: 'history',
  routes
}))
