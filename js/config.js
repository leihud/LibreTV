// 全局常量配置
const PROXY_URL = '/proxy/';    // 适用于 Cloudflare, Netlify (带重写), Vercel (带重写)
// const HOPLAYER_URL = 'https://hoplayer.com/index.html';
const SEARCH_HISTORY_KEY = 'videoSearchHistory';
const MAX_HISTORY_ITEMS = 5;

// 默认封面图片（优雅的渐变背景 + 播放图标）
const DEFAULT_COVER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgNDUwIiBoZWlnaHQ9IjQ1MCIgd2lkdGg9IjMwMCI+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiIGQ9Ik0wIDBoMzAwdjQ1MEgweiIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxMTExMTEiIHJ4PSIyIi8+PHJlY3QgeD0iNTAlIiB5PSI1MCUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0ibm9uZSIgcng9IjEiLz48cmVjdCB4PSI1MCUiIHk9IjUwJSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMzMzMzMzIiByeD0iMSIvPjxyZWN0IHg9IjUwJSIgeT0iNTAlIiB3aWR0aD0iNzAiIGhlaWdodD0iNDAiIGZpbGw9IiM0NDQ0NDQiIHJ4PSIxIi8+PHBhdGggZD0iTTg3LjUgMjIwIDYzIDIzMy41djItMjcgMjQuNS0xMy41IDg3LjUgNDAuNXoiIGZpbGw9IiNmZmYiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+';

// 默认封面图片 URL（用于 onerror）
const DEFAULT_COVER_URL = `url(${DEFAULT_COVER_IMAGE})`;

/**
 * 生成带标题的默认封面图
 * @param {string} title - 内容标题
 * @returns {string} - base64 编码的 SVG 图片
 */
function generateDefaultCover(title) {
    // 清理标题，移除特殊字符
    const cleanTitle = (title || '无标题').replace(/[<>&"]/g, function(c) {
        const entities = {'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;'};
        return entities[c];
    });
    
    // 截断长标题（最多显示16个字符）
    const displayTitle = cleanTitle.length > 16 ? cleanTitle.substring(0, 16) + '...' : cleanTitle;
    
    // 生成 SVG
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" height="450" width="300">
            <defs>
                <linearGradient id="coverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1a1a"/>
                    <stop offset="100%" style="stop-color:#0d0d0d"/>
                </linearGradient>
            </defs>
            <!-- 背景 -->
            <rect width="100%" height="100%" fill="url(#coverGradient)"/>
            <!-- 装饰性圆环 -->
            <circle cx="150" cy="180" r="35" fill="none" stroke="#2a2a2a" stroke-width="2"/>
            <circle cx="150" cy="180" r="45" fill="none" stroke="#1f1f1f" stroke-width="1"/>
            <circle cx="150" cy="180" r="55" fill="none" stroke="#1a1a1a" stroke-width="1"/>
            <!-- 播放按钮 -->
            <polygon points="130,165 130,195 160,180" fill="#ffffff"/>
            <!-- 标题文字 - 加粗加大字号 -->
            <text x="150" y="265" text-anchor="middle" fill="#ffffff" font-size="22" font-family="sans-serif" font-weight="bold">${displayTitle}</text>
        </svg>
    `.replace(/\s+/g, ' ').trim();
    
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

/**
 * 处理图片URL，支持完整URL、协议相对URL和相对路径
 * @param {string} picUrl - 原始图片URL
 * @param {string} sourceCode - API来源代码
 * @param {string} apiUrl - 自定义API URL（可选）
 * @returns {string|null} - 处理后的完整图片URL，无法处理时返回null
 */
function resolveCoverUrl(picUrl, sourceCode, apiUrl) {
    if (!picUrl || !picUrl.trim()) {
        return null;
    }
    
    picUrl = picUrl.trim();
    
    if (picUrl.startsWith('http')) {
        // 完整URL，直接使用
        return picUrl;
    }
    
    if (picUrl.startsWith('//')) {
        // 协议相对URL，添加https协议
        return 'https:' + picUrl;
    }
    
    // 相对路径，尝试拼接API站点的基础URL
    let baseUrl = '';
    
    if (apiUrl) {
        baseUrl = apiUrl.replace(/\/api\.php.*/, '');
    } else if (sourceCode && API_SITES[sourceCode]) {
        baseUrl = API_SITES[sourceCode].detail || API_SITES[sourceCode].api.replace(/\/api\.php.*/, '');
    }
    
    if (baseUrl) {
        // 如果图片路径不以 / 开头，添加 /
        if (!picUrl.startsWith('/')) {
            picUrl = '/' + picUrl;
        }
        return baseUrl + picUrl;
    }
    
    return null;
}

// 密码保护配置
const PASSWORD_CONFIG = {
    localStorageKey: 'passwordVerified',  // 存储验证状态的键名
    verificationTTL: 90 * 24 * 60 * 60 * 1000,  // 验证有效期（90天，约3个月）
    enablePasswordProtection: true  // 是否启用密码保护（设为false可禁用，但不建议在公网部署时禁用）
};

// 网站信息配置
const SITE_CONFIG = {
    name: '蚕宝宝TV',
    url: 'https://libretv.is-an.org',
    description: '蚕宝宝的小电视',
    logo: 'image/logo.png',
    version: '1.0.3'
};

// API站点配置
const API_SITES = {
    dyttzy: {
        api: 'http://caiji.dyttzyapi.com/api.php/provide/vod',
        name: '电影天堂资源',
        detail: 'http://caiji.dyttzyapi.com',
    },
    ruyi: {
        api: 'https://cj.rycjapi.com/api.php/provide/vod',
        name: '如意资源',
    },
    bfzy: {
        api: 'https://bfzyapi.com/api.php/provide/vod',
        name: '暴风资源',
    },
    tyyszy: {
        api: 'https://tyyszy.com/api.php/provide/vod',
        name: '天涯资源',
    },
    xiaomaomi: {
        api: 'https://zy.xmm.hk/api.php/provide/vod',
        name: '小猫咪资源',
    },
    ffzy: {
        api: 'http://ffzy5.tv/api.php/provide/vod',
        name: '非凡影视',
        detail: 'http://ffzy5.tv',
    },
    heimuer: {
        api: 'https://json.heimuer.xyz/api.php/provide/vod',
        name: '黑木耳',
        detail: 'https://heimuer.tv',
    },
    zy360: {
        api: 'https://360zy.com/api.php/provide/vod',
        name: '360资源',
    },
    iqiyi: {
        api: 'https://www.iqiyizyapi.com/api.php/provide/vod',
        name: 'iqiyi资源',
    },
    wolong: {
        api: 'https://wolongzyw.com/api.php/provide/vod',
        name: '卧龙资源',
    },
    hwba: {
        api: 'https://cjhwba.com/api.php/provide/vod',
        name: '华为吧资源',
    },
    jisu: {
        api: 'https://jszyapi.com/api.php/provide/vod',
        name: '极速资源',
        detail: 'https://jszyapi.com',
    },
    dbzy: {
        api: 'https://dbzy.tv/api.php/provide/vod',
        name: '豆瓣资源',
    },
    mozhua: {
        api: 'https://mozhuazy.com/api.php/provide/vod',
        name: '魔爪资源',
    },
    mdzy: {
        api: 'https://www.mdzyapi.com/api.php/provide/vod',
        name: '魔都资源',
    },
    zuid: {
        api: 'https://api.zuidapi.com/api.php/provide/vod',
        name: '最大资源'
    },
    yinghua: {
        api: 'https://m3u8.apiyhzy.com/api.php/provide/vod',
        name: '樱花资源'
    },
    baidu: {
        api: 'https://api.apibdzy.com/api.php/provide/vod',
        name: '百度云资源'
    },
    wujin: {
        api: 'https://api.wujinapi.me/api.php/provide/vod',
        name: '无尽资源'
    },
    wwzy: {
        api: 'https://wwzy.tv/api.php/provide/vod',
        name: '旺旺短剧'
    },
    ikun: {
        api: 'https://ikunzyapi.com/api.php/provide/vod',
        name: 'iKun资源'
    },
    lzi: {
        api: 'https://cj.lziapi.com/api.php/provide/vod/',
        name: '量子资源站'
    },
    testSource: {
        api: 'https://www.example.com/api.php/provide/vod',
        name: '空内容测试源',
        adult: true

    }
    //ARCHIVE https://telegra.ph/APIs-08-12
};

// 定义合并方法
function extendAPISites(newSites) {
    Object.assign(API_SITES, newSites);
}

// 暴露到全局
window.API_SITES = API_SITES;
window.extendAPISites = extendAPISites;


// 添加聚合搜索的配置选项
const AGGREGATED_SEARCH_CONFIG = {
    enabled: true,             // 是否启用聚合搜索
    timeout: 8000,            // 单个源超时时间（毫秒）
    maxResults: 10000,          // 最大结果数量
    parallelRequests: true,   // 是否并行请求所有源
    showSourceBadges: true    // 是否显示来源徽章
};

// 抽象API请求配置
const API_CONFIG = {
    search: {
        // 只拼接参数部分，不再包含 /api.php/provide/vod/
        path: '?ac=videolist&wd=',
        pagePath: '?ac=videolist&wd={query}&pg={page}',
        maxPages: 50, // 最大获取页数
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    },
    detail: {
        // 只拼接参数部分
        path: '?ac=videolist&ids=',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    }
};

// 优化后的正则表达式模式
const M3U8_PATTERN = /\$https?:\/\/[^"'\s]+?\.m3u8/g;

// 添加自定义播放器URL
const CUSTOM_PLAYER_URL = 'player.html'; // 使用相对路径引用本地player.html

// 增加视频播放相关配置
const PLAYER_CONFIG = {
    autoplay: true,
    allowFullscreen: true,
    width: '100%',
    height: '600',
    timeout: 15000,  // 播放器加载超时时间
    filterAds: true,  // 是否启用广告过滤
    autoPlayNext: true,  // 默认启用自动连播功能
    adFilteringEnabled: true, // 默认开启分片广告过滤
    adFilteringStorage: 'adFilteringEnabled' // 存储广告过滤设置的键名
};

// 增加错误信息本地化
const ERROR_MESSAGES = {
    NETWORK_ERROR: '网络连接错误，请检查网络设置',
    TIMEOUT_ERROR: '请求超时，服务器响应时间过长',
    API_ERROR: 'API接口返回错误，请尝试更换数据源',
    PLAYER_ERROR: '播放器加载失败，请尝试其他视频源',
    UNKNOWN_ERROR: '发生未知错误，请刷新页面重试'
};

// 添加进一步安全设置
const SECURITY_CONFIG = {
    enableXSSProtection: true,  // 是否启用XSS保护
    sanitizeUrls: true,         // 是否清理URL
    maxQueryLength: 100,        // 最大搜索长度
    // allowedApiDomains 不再需要，因为所有请求都通过内部代理
};

// 添加多个自定义API源的配置
const CUSTOM_API_CONFIG = {
    separator: ',',           // 分隔符
    maxSources: 5,            // 最大允许的自定义源数量
    testTimeout: 5000,        // 测试超时时间(毫秒)
    namePrefix: 'Custom-',    // 自定义源名称前缀
    validateUrl: true,        // 验证URL格式
    cacheResults: true,       // 缓存测试结果
    cacheExpiry: 5184000000,  // 缓存过期时间(2个月)
    adultPropName: 'isAdult' // 用于标记成人内容的属性名
};

// 隐藏内置黄色采集站API的变量
const HIDE_BUILTIN_ADULT_APIS = false;
