#!/usr/bin/env python3
import time
import random
import json
import os
import requests

class SimpleRealAgent:
    """简单真实的Agent - 直接访问网站验证"""

    def __init__(self, name):
        self.name = name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def visit_website(self, url):
        """访问网站获取真实信息"""
        try:
            print(f"    🌐 {self.name}: 访问 {url}")
            response = self.session.get(url, timeout=15)
            content = response.text.lower()
            print(f"    📄 {self.name}: 页面内容长度 {len(content)} 字符")
            return content
        except Exception as e:
            print(f"    ❌ {self.name}: 访问失败 {e}")
            return None

class ScoutRealAgent(SimpleRealAgent):
    """Scout Agent - 真实发现平台"""
    def __init__(self):
        super().__init__("Scout")
        self.platforms = [
            # 已验证过的平台
            ("PayPal", "paypal.com", "支付平台"),
            ("Patreon", "patreon.com", "创作者订阅平台"),
            ("Buy Me a Coffee", "buymeacoffee.com", "创作者打赏平台"),
            ("Stripe", "stripe.com", "支付集成平台"),
            ("GoFundMe", "gofundme.com", "个人众筹募捐平台"),
            ("Ko-fi", "ko-fi.com", "创作者打赏平台"),
            ("Venmo", "venmo.com", "个人支付平台"),
            ("Square", "squareup.com", "个人支付系统平台"),
            ("YouTube", "youtube.com", "视频创作者平台"),
            ("TikTok", "tiktok.com", "短视频创作者平台"),
            ("Substack", "substack.com", "创作者写作平台"),
            ("Medium", "medium.com", "创作者写作平台"),
            ("Ghost", "ghost.org", "博客写作平台"),
            ("Indiegogo", "indiegogo.com", "创意项目众筹平台"),
            ("Kickstarter", "kickstarter.com", "创意项目众筹平台"),
            ("Eventbrite", "eventbrite.com", "活动票务平台"),
            ("Teachable", "teachable.com", "在线课程教育平台"),
            ("Thinkific", "thinkific.com", "在线课程教育平台"),
            ("Kajabi", "kajabi.com", "知识付费教育平台"),
            ("LearnWorlds", "learnworlds.com", "知识付费教育平台"),
            ("Podia", "podia.com", "在线课程教育平台"),
            ("Gumroad", "gumroad.com", "数字产品销售平台"),
            ("Etsy", "etsy.com", "手工制品销售平台"),
            ("Shopify", "shopify.com", "电商建站平台"),
            ("BigCommerce", "bigcommerce.com", "电商平台"),
            ("WooCommerce", "woocommerce.com", "电商平台"),
            ("Bandcamp", "bandcamp.com", "音乐人销售平台"),
            ("Twitch", "twitch.com", "游戏直播平台"),
            ("Instagram", "instagram.com", "社交电商平台"),
            ("Facebook", "facebook.com", "社交支付平台"),
            ("Twitter", "twitter.com", "社交平台"),
            ("LinkedIn", "linkedin.com", "职业社交平台"),
            ("Discord", "discord.com", "社区平台"),
            ("Mighty Networks", "mightynetworks.com", "社区平台"),
            ("Circle", "circle.so", "社区平台"),
            ("Memberful", "memberful.com", "会员订阅平台"),
            ("DeviantArt", "deviantart.com", "创作者艺术平台"),
            ("Redbubble", "redbubble.com", "创作者艺术品平台"),
            ("Society6", "society6.com", "创作者艺术品平台"),
            ("Zazzle", "zazzle.com", "创作者定制产品平台"),
            ("Cafepress", "cafepress.com", "创作者定制产品平台"),
            ("Printful", "printful.com", "按需打印平台"),
            ("Printify", "printify.com", "按需打印平台"),
            ("Spring", "spring.com", "创作者定制平台"),
            ("Teespring", "teespring.com", "创作者服装平台"),
            ("Represent", "represent.com", "创作者服装平台"),
            ("4Fund", "4fund.com", "众筹募捐平台"),
            ("Fundly", "fundly.com", "个人众筹募捐平台"),
            ("YouCaring", "youcaring.com", "个人众筹募捐平台"),
            ("Crowdfunder", "crowdfunder.co.uk", "众筹募捐平台"),
            ("GoGetFunding", "gogetfunding.com", "个人众筹募捐平台"),
            ("FundRazr", "fundrazr.com", "社交众筹平台"),
            ("Plumfund", "plumfund.com", "个人募捐平台"),
            ("JustGiving", "justgiving.com", "慈善募捐平台"),
            ("Classy", "classy.org", "非营利募捐平台"),
            ("Network for Good", "networkforgood.com", "慈善募捐平台"),
            ("Donorbox", "donorbox.com", "非营利募捐平台"),
            ("Seedrs", "seedrs.com", "股权众筹平台"),
            ("Crowdcube", "crowdcube.com", "股权众筹平台"),
            ("AngelList", "angel.co", "投资平台"),
            ("Wefunder", "wefunder.com", "股权众筹平台"),
            ("Republic", "republic.co", "股权众筹平台"),
            ("StartEngine", "startengine.com", "股权众筹平台"),
            ("SeedInvest", "seedinvest.com", "股权众筹平台"),
            ("Microventures", "microventures.com", "股权众筹平台"),
            ("Fundable", "fundable.com", "商业众筹平台"),
            ("Crowd Supply", "crowdsupply.com", "硬件众筹平台"),
            ("Ulule", "ulule.com", "创意众筹平台"),
            ("KissKissBankBank", "kisskissbankbank.com", "创意众筹平台"),
            ("Pledgemusic", "pledgemusic.com", "音乐众筹平台"),
            ("OpenSea", "opensea.io", "NFT交易平台"),
            ("Figma", "figma.com", "设计工具平台"),
            ("Canva", "canva.com", "设计工具平台"),
            ("Adobe", "adobe.com", "设计素材平台"),
            ("Upwork", "upwork.com", "自由职业平台"),
            ("Fiverr", "fiverr.com", "自由职业平台"),
            ("AWS", "aws.amazon.com", "云服务平台"),
            ("DigitalOcean", "digitalocean.com", "云服务平台"),
            ("GitHub", "github.com", "开发者平台"),

            # 新增50个平台
            ("OnlyFans", "onlyfans.com", "创作者订阅平台"),
            ("Fansly", "fansly.com", "创作者订阅平台"),
            ("Fanhouse", "fanhouse.com", "创作者订阅平台"),
            ("JustForFans", "justfor.fans", "创作者订阅平台"),
            ("AdmireMe", "admireme.com", "创作者订阅平台"),
            ("Ko-fi Gold", "ko-fi.com/gold", "创作者打赏平台"),
            ("Buy Me a Coffee", "buymeacoffee.com", "创作者打赏平台"),
            ("Patreon", "patreon.com", "创作者订阅平台"),
            ("Substack", "substack.com", "创作者写作平台"),
            ("Medium", "medium.com", "创作者写作平台"),
            ("Ghost", "ghost.org", "博客写作平台"),
            ("Revolut", "revolut.com", "数字银行平台"),
            ("Wise", "wise.com", "数字银行平台"),
            ("TransferWise", "transferwise.com", "数字银行平台"),
            ("Payoneer", "payoneer.com", "数字银行平台"),
            ("Skrill", "skrill.com", "数字银行平台"),
            ("Neteller", "neteller.com", "数字银行平台"),
            ("Coinbase", "coinbase.com", "加密货币平台"),
            ("Binance", "binance.com", "加密货币平台"),
            ("Kraken", "kraken.com", "加密货币平台"),
            ("Robinhood", "robinhood.com", "投资交易平台"),
            ("Webull", "webull.com", "投资交易平台"),
            ("Public", "public.com", "投资交易平台"),
            ("M1 Finance", "m1finance.com", "投资交易平台"),
            ("SoFi", "sofi.com", "金融科技平台"),
            ("Chime", "chime.com", "数字银行平台"),
            ("Varo", "varo.com", "数字银行平台"),
            ("N26", "n26.com", "数字银行平台"),
            ("Monzo", "monzo.com", "数字银行平台"),
            ("Revolut", "revolut.com", "数字银行平台"),
            ("Cash App", "cash.app", "数字支付平台"),
            ("Venmo", "venmo.com", "数字支付平台"),
            ("Zelle", "zellepay.com", "数字支付平台"),
            ("Cash App", "cash.app", "数字支付平台"),
            ("Square", "squareup.com", "支付系统平台"),
            ("Toast", "toast.com", "餐厅支付平台"),
            ("Shopify", "shopify.com", "电商建站平台"),
            ("BigCommerce", "bigcommerce.com", "电商平台"),
            ("WooCommerce", "woocommerce.com", "电商平台"),
            ("Magento", "magento.com", "电商平台"),
            ("Shopify Plus", "shopify.com/plus", "电商建站平台"),
            ("BigCommerce Enterprise", "bigcommerce.com/enterprise", "企业电商平台"),
            ("WooCommerce Memberships", "woocommerce.com/products/woocommerce-memberships", "会员订阅平台"),
            ("EasyDigitalDownloads", "easydigitaldownloads.com", "数字产品销售平台"),
            ("Fetch", "fetchapp.com", "电商建站平台"),
            ("Sellfy", "sellfy.com", "数字产品销售平台"),
            ("Gumroad", "gumroad.com", "数字产品销售平台"),
            ("Product Hunt", "producthunt.com", "产品发现平台"),
            ("Launch Academy", "launch-academy.com", "在线教育平台"),
            ("Skillshare", "skillshare.com", "在线教育平台"),
            ("Udemy", "udemy.com", "在线课程教育平台"),
            ("Coursera", "coursera.org", "在线课程教育平台"),
            ("edX", "edx.org", "在线课程教育平台"),
            ("Khan Academy", "khanacademy.org", "在线教育平台"),
            ("MasterClass", "masterclass.com", "在线课程教育平台"),
            ("Domestika", "domestika.org", "在线课程教育平台"),
            ("Teachable", "teachable.com", "在线课程教育平台"),
            ("Thinkific", "thinkific.com", "在线课程教育平台"),
            ("Podia", "podia.com", "在线课程教育平台"),
            ("LearnWorlds", "learnworlds.com", "知识付费教育平台"),
            ("Kajabi", "kajabi.com", "知识付费教育平台"),
            ("Systeme", "systeme.io", "在线课程教育平台"),
            ("ClickFunnels", "clickfunnels.com", "营销工具平台"),
            ("ConvertKit", "convertkit.com", "邮件营销平台"),
            ("Mailchimp", "mailchimp.com", "邮件营销平台"),
            ("AWeber", "aweber.com", "邮件营销平台"),
            ("GetResponse", "getresponse.com", "邮件营销平台"),
            ("ActiveCampaign", "activecampaign.com", "邮件营销平台"),
            ("HubSpot", "hubspot.com", "CRM营销平台"),
            ("Salesforce", "salesforce.com", "CRM营销平台"),
            ("Zendesk", "zendesk.com", "客服支持平台"),
            ("Intercom", "intercom.com", "客服支持平台"),
            ("Freshdesk", "freshdesk.com", "客服支持平台"),
            ("Help Scout", "helpscout.net", "客服支持平台"),
            ("Twilio", "twilio.com", "通信服务平台"),
            ("SendGrid", "sendgrid.com", "邮件服务平台"),
            ("Mailgun", "mailgun.com", "邮件服务平台"),
            ("Postmark", "postmarkapp.com", "邮件服务平台"),
            ("ClickBank", "clickbank.com", "联盟营销平台"),
            ("ShareASale", "shareasale.com", "联盟营销平台"),
            ("CJ Affiliate", "cj.com", "联盟营销平台"),
            ("Rakuten", "rakuten.com", "联盟营销平台"),
            ("Amazon Associates", "affiliate-program.amazon.com", "联盟营销平台"),
            ("eBay Partner Network", "partnernetwork.ebay.com", "联盟营销平台"),
            ("Shopify Affiliate", "shopify.com/affiliate", "联盟营销平台"),
            ("BigCommerce Affiliate", "bigcommerce.com/affiliate", "联盟营销平台"),
            ("Stripe Connect", "stripe.com/connect", "支付平台"),
            ("PayPal Partners", "paypal.com/partners", "支付平台"),
            ("Square App Marketplace", "squareup.com/marketplace", "支付平台"),
            ("Toast", "toast.com", "餐厅支付平台"),
            ("Lightspeed", "lightspeedhq.com", "餐厅支付平台"),
            ("Shopkeep", "shopkeep.com", "POS系统平台"),
            ("Toast POS", "toasttab.com", "POS系统平台"),
            ("Square POS", "squareup.com/pos", "POS系统平台"),
            ("Clover", "clover.com", "POS系统平台"),
            ("Poynt", "poynt.com", "POS系统平台"),
            ("Revel", "revelup.com", "POS系统平台"),
            ("TouchBistro", "touchbistro.com", "POS系统平台"),
            ("Shopify POS", "shopify.com/pos", "POS系统平台"),
            ("BigCommerce POS", "bigcommerce.com/pos", "POS系统平台"),
            ("WooCommerce POS", "woocommerce.com/products/woocommerce-pos", "POS系统平台"),
            ("Magento POS", "magento.com/magento-pos", "POS系统平台"),
            ("Lightspeed POS", "lightspeedhq.com/pos", "POS系统平台"),
            ("Toast POS", "toasttab.com/pos", "POS系统平台"),
            ("Square for Restaurants", "squareup.com/restaurants", "餐厅支付平台"),
            ("Clover for Restaurants", "clover.com/restaurant", "餐厅支付平台"),
            ("Poynt for Restaurants", "poynt.com/restaurant", "餐厅支付平台"),
            ("Revel for Restaurants", "revelup.com/restaurant", "餐厅支付平台"),
            ("Shopkeep for Restaurants", "shopkeep.com/restaurant", "餐厅支付平台"),
            ("Toast for Restaurants", "toasttab.com/restaurant", "餐厅支付平台"),
            ("Lightspeed for Restaurants", "lightspeedhq.com/restaurant", "餐厅支付平台"),
            ("Square for Retail", "squareup.com/retail", "零售支付平台"),
            ("Clover for Retail", "clover.com/retail", "零售支付平台"),
            ("Poynt for Retail", "poynt.com/retail", "零售支付平台"),
            ("Revel for Retail", "revelup.com/retail", "零售支付平台"),
            ("TouchBistro for Retail", "touchbistro.com/retail", "零售支付平台"),
            ("Shopify for Retail", "shopify.com/retail", "零售支付平台"),
            ("BigCommerce for Retail", "bigcommerce.com/retail", "零售支付平台"),
            ("WooCommerce for Retail", "woocommerce.com/products/woocommerce-retail", "零售支付平台"),
            ("Magento for Retail", "magento.com/magento-retail", "零售支付平台"),
            ("Lightspeed for Retail", "lightspeedhq.com/retail", "零售支付平台"),
            ("Toast for Retail", "toasttab.com/retail", "零售支付平台"),
            ("Square for E-commerce", "squareup.com/ecommerce", "电商支付平台"),
            ("Stripe for E-commerce", "stripe.com/ecommerce", "电商支付平台"),
            ("PayPal for E-commerce", "paypal.com/ecommerce", "电商支付平台"),
            ("Braintree", "braintreepayments.com", "电商支付平台"),
            ("Adyen", "adyen.com", "电商支付平台"),
            ("Klarna", "klarna.com", "先买后付款平台"),
            ("Afterpay", "afterpay.com", "先买后付款平台"),
            ("Affirm", "affirm.com", "先买后付款平台"),
            ("Sezzle", "sezzle.com", "先买后付款平台"),
            ("Quadpay", "quadpay.com", "先买后付款平台"),
            ("PayPal Credit", "paypal.com/credit", "信贷平台"),
            ("Affirm", "affirm.com", "信贷平台"),
            ("Klarna", "klarna.com", "信贷平台"),
            ("Afterpay", "afterpay.com", "信贷平台"),
            ("Sezzle", "sezzle.com", "信贷平台"),
            ("Quadpay", "quadpay.com", "信贷平台"),
            ("Wise", "wise.com", "国际汇款平台"),
            ("Remitly", "remitly.com", "国际汇款平台"),
            ("WorldRemit", "worldremit.com", "国际汇款平台"),
            ("TransferWise", "transferwise.com", "国际汇款平台"),
            ("Western Union", "westernunion.com", "国际汇款平台"),
            ("MoneyGram", "moneygram.com", "国际汇款平台"),
            ("Xoom", "xoom.com", "国际汇款平台"),
            ("Payoneer", "payoneer.com", "国际汇款平台"),
            ("Skrill", "skrill.com", "国际汇款平台"),
            ("Neteller", "neteller.com", "国际汇款平台"),
            ("Revolut", "revolut.com", "国际汇款平台"),
            ("Wise", "wise.com", "国际汇款平台"),
            ("TransferWise", "transferwise.com", "国际汇款平台"),
            ("Remitly", "remitly.com", "国际汇款平台"),
            ("WorldRemit", "worldremit.com", "国际汇款平台"),
            ("Western Union", "westernunion.com", "国际汇款平台"),
            ("MoneyGram", "moneygram.com", "国际汇款平台"),
            ("Xoom", "xoom.com", "国际汇款平台"),
            ("Coinbase", "coinbase.com", "加密货币交易所"),
            ("Binance", "binance.com", "加密货币交易所"),
            ("Kraken", "kraken.com", "加密货币交易所"),
            ("Coinbase Pro", "pro.coinbase.com", "加密货币交易所"),
            ("Binance US", "binance.us", "加密货币交易所"),
            ("Kraken", "kraken.com", "加密货币交易所"),
            ("Gemini", "gemini.com", "加密货币交易所"),
            ("Bitstamp", "bitstamp.net", "加密货币交易所"),
            ("OKCoin", "okcoin.com", "加密货币交易所"),
            ("Bitfinex", "bitfinex.com", "加密货币交易所"),
            ("Huobi", "huobi.com", "加密货币交易所"),
            ("KuCoin", "kucoin.com", "加密货币交易所"),
            ("Gate.io", "gate.io", "加密货币交易所"),
            ("Crypto.com", "crypto.com", "加密货币交易所"),
            ("Bybit", "bybit.com", "加密货币交易所"),
            ("MEXC", "mexc.com", "加密货币交易所"),
            ("KuCoin", "kucoin.com", "加密货币交易所"),
            ("Gate.io", "gate.io", "加密货币交易所"),
            ("Bitfinex", "bitfinex.com", "加密货币交易所"),
            ("OKX", "okx.com", "加密货币交易所"),
            ("Bitget", "bitget.com", "加密货币交易所"),
            ("MEXC", "mexc.com", "加密货币交易所"),
            ("BitMart", "bitmart.com", "加密货币交易所"),
            ("LBank", "lbank.com", "加密货币交易所"),
            ("Bitrue", "bitrue.com", "加密货币交易所"),
            ("Poloniex", "poloniex.com", "加密货币交易所"),
            ("Bittrex", "bittrex.com", "加密货币交易所"),
            ("HitBTC", "hitbtc.com", "加密货币交易所"),
            ("CoinEx", "coinex.com", "加密货币交易所"),
            ("Hotbit", "hotbit.com", "加密货币交易所"),
            ("Bit-Z", "bit-z.com", "加密货币交易所"),
            ("NovaDAX", "novadax.com", "加密货币交易所"),
            ("Bibox", "bibox.com", "加密货币交易所"),
            ("BKEX", "bkex.com", "加密货币交易所"),
            ("XT", "xt.com", "加密货币交易所"),
            ("LATOKEN", "latoken.com", "加密货币交易所"),
            ("ProBit", "probit.com", "加密货币交易所"),
            ("BingX", "bingx.com", "加密货币交易所"),
            ("Coincheck", "coincheck.com", "加密货币交易所"),
            ("BlockFi", "blockfi.com", "加密货币借贷平台"),
            ("Nexo", "nexo.com", "加密货币借贷平台"),
            ("Celsius", "celsius.com", "加密货币借贷平台"),
            ("Vauld", "vauld.com", "加密货币借贷平台"),
            ("Ledn", "ledn.com", "加密货币借贷平台"),
            ("YouHodler", "youhodler.com", "加密货币借贷平台"),
            ("Salt", "saltlending.com", "加密货币借贷平台"),
            ("Compound", "compound.finance", "去中心化金融"),
            ("Aave", "aave.com", "去中心化金融"),
            ("MakerDAO", "makerdao.com", "去中心化金融"),
            ("Uniswap", "uniswap.org", "去中心化金融"),
            ("SushiSwap", "sushiswap.com", "去中心化金融"),
            ("PancakeSwap", "pancakeswap.finance", "去中心化金融"),
            ("Curve", "curve.fi", "去中心化金融"),
            ("Yearn Finance", "yearn.finance", "去中心化金融"),
            ("Balancer", "balancer.fi", "去中心化金融"),
            ("1inch", "1inch.io", "去中心化金融"),
            ("0x", "0x.org", "去中心化金融"),
            ("Matcha", "matcha.xyz", "去中心化金融"),
            ("InstaDApp", "instadapp.com", "去中心化金融"),
            ("MetaMask", "metamask.io", "去中心化金融"),
            ("Trust Wallet", "trustwallet.com", "去中心化金融"),
            ("Coinbase Wallet", "wallet.coinbase.com", "去中心化金融"),
            ("Ledger", "ledger.com", "硬件钱包平台"),
            ("Trezor", "trezor.io", "硬件钱包平台"),
            ("KeepKey", "keepkey.com", "硬件钱包平台"),
            ("Coldcard", "coldcard.com", "硬件钱包平台"),
            ("Ellipal", "ellipal.com", "硬件钱包平台"),
            ("SafePal", "safepal.com", "硬件钱包平台"),
            ("NGRAVE", "ngrave.io", "硬件钱包平台"),
            ("Jolt", "jolt.com", "硬件钱包平台"),
            ("CoolWallet", "coolwallet.com", "硬件钱包平台"),
            ("BitBox", "bitbox.com", "硬件钱包平台"),
            ("KeepKey", "keepkey.com", "硬件钱包平台"),
            ("Ledger", "ledger.com", "硬件钱包平台"),
            ("Trezor", "trezor.io", "硬件钱包平台"),
            ("Shapeshift", "shapeshift.com", "硬件钱包平台"),
            ("Changelly", "changelly.com", "硬件钱包平台"),
            ("SimpleSwap", "simpleswap.io", "硬件钱包平台"),
            ("ChangeNOW", "changenow.io", "硬件钱包平台"),
            ("Godex", "godex.com", "硬件钱包平台"),
            ("Float", "float.com", "浮动汇率平台"),
            ("Kraken", "kraken.com", "浮动汇率平台"),
            ("Binance", "binance.com", "浮动汇率平台"),
            ("Coinbase", "coinbase.com", "浮动汇率平台"),
            ("Gemini", "gemini.com", "浮动汇率平台"),
            ("Bitstamp", "bitstamp.net", "浮动汇率平台"),
            ("OKCoin", "okcoin.com", "浮动汇率平台"),
            ("Bitfinex", "bitfinex.com", "浮动汇率平台"),
            ("Poloniex", "poloniex.com", "浮动汇率平台"),
            ("Bittrex", "bittrex.com", "浮动汇率平台"),
            ("Huobi", "huobi.com", "浮动汇率平台"),
            ("KuCoin", "kucoin.com", "浮动汇率平台"),
            ("Gate.io", "gate.io", "浮动汇率平台"),
            ("Bybit", "bybit.com", "浮动汇率平台"),
            ("Bitget", "bitget.com", "浮动汇率平台"),
            ("MEXC", "mexc.com", "浮动汇率平台"),
            ("BitMart", "bitmart.com", "浮动汇率平台"),
            ("LBank", "lbank.com", "浮动汇率平台"),
            ("Bitrue", "bitrue.com", "浮动汇率平台"),
            ("Hotbit", "hotbit.com", "浮动汇率平台"),
            ("Bit-Z", "bit-z.com", "浮动汇率平台"),
            ("NovaDAX", "novadax.com", "浮动汇率平台"),
            ("Bibox", "bibox.com", "浮动汇率平台"),
            ("BKEX", "bkex.com", "浮动汇率平台"),
            ("XT", "xt.com", "浮动汇率平台"),
            ("LATOKEN", "latoken.com", "浮动汇率平台"),
            ("ProBit", "probit.com", "浮动汇率平台"),
            ("BingX", "bingx.com", "浮动汇率平台"),
            ("Coincheck", "coincheck.com", "浮动汇率平台"),
            ("CoinMarketCap", "coinmarketcap.com", "加密货币信息平台"),
            ("CoinGecko", "coingecko.com", "加密货币信息平台"),
            ("Coinpaprika", "coinpaprika.com", "加密货币信息平台"),
            ("Messari", "messari.io", "加密货币信息平台"),
            ("Nomics", "nomics.com", "加密货币信息平台"),
            ("CoinRanking", "coinranking.com", "加密货币信息平台"),
            ("CryptoCompare", "cryptocompare.com", "加密货币信息平台"),
            ("CoinCodex", "coincodex.com", "加密货币信息平台"),
            ("Live Coin Watch", "livecoinwatch.com", "加密货币信息平台"),
            ("Coinbase", "coinbase.com", "加密货币信息平台"),
            ("Binance", "binance.com", "加密货币信息平台"),
            ("Kraken", "kraken.com", "加密货币信息平台"),
            ("Coinbase Pro", "pro.coinbase.com", "加密货币信息平台"),
            ("Gemini", "gemini.com", "加密货币信息平台"),
            ("Bitfinex", "bitfinex.com", "加密货币信息平台"),
            ("OKCoin", "okcoin.com", "加密货币信息平台"),
            ("Bitstamp", "bitstamp.net", "加密货币信息平台"),
            ("Huobi", "huobi.com", "加密货币信息平台"),
            ("KuCoin", "kucoin.com", "加密货币信息平台"),
            ("Gate.io", "gate.io", "加密货币信息平台"),
            ("Bybit", "bybit.com", "加密货币信息平台"),
            ("Bitget", "bitget.com", "加密货币信息平台"),
            ("MEXC", "mexc.com", "加密货币信息平台"),
            ("BitMart", "bitmart.com", "加密货币信息平台"),
            ("LBank", "lbank.com", "加密货币信息平台"),
            ("Bitrue", "bitrue.com", "加密货币信息平台"),
            ("Hotbit", "hotbit.com", "加密货币信息平台"),
            ("Bit-Z", "bit-z.com", "加密货币信息平台"),
            ("NovaDAX", "novadax.com", "加密货币信息平台"),
            ("Bibox", "bibox.com", "加密货币信息平台"),
            ("BKEX", "bkex.com", "加密货币信息平台"),
            ("XT", "xt.com", "加密货币信息平台"),
            ("LATOKEN", "latoken.com", "加密货币信息平台"),
            ("ProBit", "probit.com", "加密货币信息平台"),
            ("BingX", "bingx.com", "加密货币信息平台"),
            ("Coincheck", "coincheck.com", "加密货币信息平台"),
            ("BlockFi", "blockfi.com", "加密货币借贷平台"),
            ("Nexo", "nexo.com", "加密货币借贷平台"),
            ("Celsius", "celsius.com", "加密货币借贷平台"),
            ("Vauld", "vauld.com", "加密货币借贷平台"),
            ("Ledn", "ledn.com", "加密货币借贷平台"),
            ("YouHodler", "youhodler.com", "加密货币借贷平台"),
            ("Salt", "saltlending.com", "加密货币借贷平台"),
            ("Compound", "compound.finance", "去中心化金融"),
            ("Aave", "aave.com", "去中心化金融"),
            ("MakerDAO", "makerdao.com", "去中心化金融"),
            ("Uniswap", "uniswap.org", "去中心化金融"),
            ("SushiSwap", "sushiswap.com", "去中心化金融"),
            ("PancakeSwap", "pancakeswap.finance", "去中心化金融"),
            ("Curve", "curve.fi", "去中心化金融"),
            ("Yearn Finance", "yearn.finance", "去中心化金融"),
            ("Balancer", "balancer.fi", "去中心化金融"),
            ("1inch", "1inch.io", "去中心化金融"),
            ("0x", "0x.org", "去中心化金融"),
            ("Matcha", "matcha.xyz", "去中心化金融"),
            ("InstaDApp", "instadapp.com", "去中心化金融"),
            ("MetaMask", "metamask.io", "去中心化金融"),
            ("Trust Wallet", "trustwallet.com", "去中心化金融"),
            ("Coinbase Wallet", "wallet.coinbase.com", "去中心化金融"),
            ("Ledger", "ledger.com", "硬件钱包平台"),
            ("Trezor", "trezor.io", "硬件钱包平台"),
            ("KeepKey", "keepkey.com", "硬件钱包平台"),
            ("Coldcard", "coldcard.com", "硬件钱包平台"),
            ("Ellipal", "ellipal.com", "硬件钱包平台"),
            ("SafePal", "safepal.com", "硬件钱包平台"),
            ("NGRAVE", "ngrave.io", "硬件钱包平台"),
            ("Jolt", "jolt.com", "硬件钱包平台"),
            ("CoolWallet", "coolwallet.com", "硬件钱包平台"),
            ("BitBox", "bitbox.com", "硬件钱包平台"),
            ("Shapeshift", "shapeshift.com", "硬件钱包平台"),
            ("Changelly", "changelly.com", "硬件钱包平台"),
            ("SimpleSwap", "simpleswap.io", "硬件钱包平台"),
            ("ChangeNOW", "changenow.io", "硬件钱包平台"),
            ("Godex", "godex.com", "硬件钱包平台"),
            ("Float", "float.com", "浮动汇率平台"),
            ("Kraken", "kraken.com", "浮动汇率平台"),
            ("Binance", "binance.com", "浮动汇率平台"),
            ("Coinbase", "coinbase.com", "浮动汇率平台"),
            ("Gemini", "gemini.com", "浮动汇率平台"),
            ("Bitstamp", "bitstamp.net", "浮动汇率平台"),
            ("OKCoin", "okcoin.com", "浮动汇率平台"),
            ("Bitfinex", "bitfinex.com", "浮动汇率平台"),
            ("Poloniex", "poloniex.com", "浮动汇率平台"),
            ("Bittrex", "bittrex.com", "浮动汇率平台"),
            ("Huobi", "huobi.com", "浮动汇率平台"),
            ("KuCoin", "kucoin.com", "浮动汇率平台"),
            ("Gate.io", "gate.io", "浮动汇率平台"),
            ("Bybit", "bybit.com", "浮动汇率平台"),
            ("Bitget", "bitget.com", "浮动汇率平台"),
            ("MEXC", "mexc.com", "浮动汇率平台"),
            ("BitMart", "bitmart.com", "浮动汇率平台"),
            ("LBank", "lbank.com", "浮动汇率平台"),
            ("Bitrue", "bitrue.com", "浮动汇率平台"),
            ("Hotbit", "hotbit.com", "浮动汇率平台"),
            ("Bit-Z", "bit-z.com", "浮动汇率平台"),
            ("NovaDAX", "novadax.com", "浮动汇率平台"),
            ("Bibox", "bibox.com", "浮动汇率平台"),
            ("BKEX", "bkex.com", "浮动汇率平台"),
            ("XT", "xt.com", "浮动汇率平台"),
            ("LATOKEN", "latoken.com", "浮动汇率平台"),
            ("ProBit", "probit.com", "浮动汇率平台"),
            ("BingX", "bingx.com", "浮动汇率平台"),
            ("Coincheck", "coincheck.com", "浮动汇率平台"),
            ("CoinMarketCap", "coinmarketcap.com", "加密货币信息平台"),
            ("CoinGecko", "coingecko.com", "加密货币信息平台"),
            ("Coinpaprika", "coinpaprika.com", "加密货币信息平台"),
            ("Messari", "messari.io", "加密货币信息平台"),
            ("Nomics", "nomics.com", "加密货币信息平台"),
            ("CoinRanking", "coinranking.com", "加密货币信息平台"),
            ("CryptoCompare", "cryptocompare.com", "加密货币信息平台"),
            ("CoinCodex", "coincodex.com", "加密货币信息平台"),
            ("Live Coin Watch", "livecoinwatch.com", "加密货币信息平台"),
            ("Coinbase", "coinbase.com", "加密货币信息平台"),
            ("Binance", "binance.com", "加密货币信息平台"),
            ("Kraken", "kraken.com", "加密货币信息平台"),
            ("Coinbase Pro", "pro.coinbase.com", "加密货币信息平台"),
            ("Gemini", "gemini.com", "加密货币信息平台"),
            ("Bitfinex", "bitfinex.com", "加密货币信息平台"),
            ("OKCoin", "okcoin.com", "加密货币信息平台"),
            ("Bitstamp", "bitstamp.net", "加密货币信息平台"),
            ("Huobi", "huobi.com", "加密货币信息平台"),
            ("KuCoin", "kucoin.com", "加密货币信息平台"),
            ("Gate.io", "gate.io", "加密货币信息平台"),
            ("Bybit", "bybit.com", "加密货币信息平台"),
            ("Bitget", "bitget.com", "加密货币信息平台"),
            ("MEXC", "mexc.com", "加密货币信息平台"),
            ("BitMart", "bitmart.com", "加密货币信息平台"),
            ("LBank", "lbank.com", "加密货币信息平台"),
            ("Bitrue", "bitrue.com", "加密货币信息平台"),
            ("Hotbit", "hotbit.com", "加密货币信息平台"),
            ("Bit-Z", "bit-z.com", "加密货币信息平台"),
            ("NovaDAX", "novadax.com", "加密货币信息平台"),
            ("Bibox", "bibox.com", "加密货币信息平台"),
            ("BKEX", "bkex.com", "加密货币信息平台"),
            ("XT", "xt.com", "加密货币信息平台"),
            ("LATOKEN", "latoken.com", "加密货币信息平台"),
            ("ProBit", "probit.com", "加密货币信息平台"),
            ("BingX", "bingx.com", "加密货币信息平台"),
            ("Coincheck", "coincheck.com", "加密货币信息平台"),
            ("CoinMarketCap", "coinmarketcap.com", "加密货币信息平台"),
            ("CoinGecko", "coingecko.com", "加密货币信息平台"),
            ("Coinpaprika", "coinpaprika.com", "加密货币信息平台"),
            ("Messari", "messari.io", "加密货币信息平台"),
            ("Nomics", "nomics.com", "加密货币信息平台"),
            ("CoinRanking", "coinranking.com", "加密货币信息平台"),
            ("CryptoCompare", "cryptocompare.com", "加密货币信息平台"),
            ("CoinCodex", "coincodex.com", "加密货币信息平台"),
            ("Live Coin Watch", "livecoinwatch.com", "加密货币信息平台"),
            ("Coinbase", "coinbase.com", "加密货币信息平台"),
            ("Binance", "binance.com", "加密货币信息平台"),
            ("Kraken", "kraken.com", "加密货币信息平台"),
            ("Coinbase Pro", "pro.coinbase.com", "加密货币信息平台"),
            ("Gemini", "gemini.com", "加密货币信息平台"),
            ("Bitfinex", "bitfinex.com", "加密货币信息平台"),
            ("OKCoin", "okcoin.com", "加密货币信息平台"),
            ("Bitstamp", "bitstamp.net", "加密货币信息平台"),
            ("Huobi", "huobi.com", "加密货币信息平台"),
            ("KuCoin", "kucoin.com", "加密货币信息平台"),
            ("Gate.io", "gate.io", "加密货币信息平台"),
            ("Bybit", "bybit.com", "加密货币信息平台"),
            ("Bitget", "bitget.com", "加密货币信息平台"),
            ("MEXC", "mexc.com", "加密货币信息平台"),
            ("BitMart", "bitmart.com", "加密货币信息平台"),
            ("LBank", "lbank.com", "加密货币信息平台"),
            ("Bitrue", "bitrue.com", "加密货币信息平台"),
            ("Hotbit", "hotbit.com", "加密货币信息平台"),
            ("Bit-Z", "bit-z.com", "加密货币信息平台"),
            ("NovaDAX", "novadax.com", "加密货币信息平台"),
            ("Bibox", "bibox.com", "加密货币信息平台"),
            ("BKEX", "bkex.com", "加密货币信息平台"),
            ("XT", "xt.com", "加密货币信息平台"),
            ("LATOKEN", "latoken.com", "加密货币信息平台"),
            ("ProBit", "probit.com", "加密货币信息平台"),
            ("BingX", "bingx.com", "加密货币信息平台"),
            ("Coincheck", "coincheck.com", "加密货币信息平台"),
            ("CoinMarketCap", "coinmarketcap.com", "加密货币信息平台"),
            ("CoinGecko", "coingecko.com", "加密货币信息平台"),
            ("Coinpaprika", "coinpaprika.com", "加密货币信息平台"),
            ("Messari", "messari.io", "加密货币信息平台"),
            ("Nomics", "nomics.com", "加密货币信息平台"),
            ("CoinRanking", "coinranking.com", "加密货币信息平台"),
            ("CryptoCompare", "cryptocompare.com", "加密货币信息平台"),
            ("CoinCodex", "coincodex.com", "加密货币信息平台"),
            ("Live Coin Watch", "livecoinwatch.com", "加密货币信息平台")
        ]
        self.discovered_names = set()  # 记录已发现的平台名称
        self.index = 0

    def discover_platforms(self, count=3, already_validated=set()):
        """发现新平台"""
        # 过滤掉已经验证过的平台
        available_platforms = [p for p in self.platforms if p[0] not in already_validated and p[0] not in self.discovered_names]

        if not available_platforms:
            print(f"    🔍 {self.name}: 所有平台已发现完毕")
            return []

        selected = available_platforms[:count]

        # 记录已发现的平台
        for platform in selected:
            self.discovered_names.add(platform[0])

        self.index += count

        print(f"    🔍 过滤结果: 总平台{len(self.platforms)}, 已验证{len(already_validated)}, 已发现{len(self.discovered_names)}, 可用{len(available_platforms)}")
        print(f"    🎯 {self.name}: 发现 {len(selected)} 个新平台")
        return selected

class ValidatorRealAgent(SimpleRealAgent):
    """Validator Agent - 真实验证4项标准"""
    def __init__(self):
        super().__init__("Validator")
        self.cache_file = "real_validation_results.json"
        self.results = self._load_results()

    def _load_results(self):
        """加载验证结果"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def _save_results(self):
        """保存验证结果"""
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(self.results, f, indent=2)
        except Exception as e:
            print(f"  ❌ 保存缓存失败: {e}")

    def _check_personal_registration(self, name, content):
        """检查个人注册"""
        keywords = ['sign up', 'create account', 'register', 'join', '个人注册', '创建账户']
        return any(kw in content for kw in keywords)

    def _check_payment_reception(self, name, content):
        """检查支付接收"""
        keywords = ['receive payment', 'get paid', 'donation', 'tip', 'support', '收款', '打赏']
        return any(kw in content for kw in keywords)

    def _check_own_payment_system(self, name, content):
        """检查自有支付系统"""
        payment_brands = ['paypal', 'stripe', 'square', 'venmo', 'ach', 'bank transfer']
        return any(brand in content for brand in payment_brands)

    def _check_usa_ach_support(self, name, content):
        """检查美国/ACH支持"""
        usa_keywords = ['usa', 'united states', 'usd', '$', '美国', '美元']
        ach_keywords = ['ach', 'bank transfer', 'direct deposit', 'routing number']
        return any(kw in content for kw in usa_keywords + ach_keywords)

    def validate_platform(self, name, domain, platform_type):
        """验证一个平台"""
        if name in self.results:
            result = self.results[name]
            print(f"    ⏭️ {self.name}: {name} 已验证 - {result['summary']}")
            return result

        print(f"    🔍 {self.name}: 开始验证 {name}")

        # 访问网站
        content = self.visit_website(f"https://{domain}")
        if not content:
            return None

        # 4项验证
        tests = [
            ("个人注册", self._check_personal_registration(name, content)),
            ("支付接收", self._check_payment_reception(name, content)),
            ("自有支付系统", self._check_own_payment_system(name, content)),
            ("美国/ACH支持", self._check_usa_ach_support(name, content))
        ]

        results = []
        passed = 0
        for test_name, test_result in tests:
            status = "✅ 通过" if test_result else "❌ 不通过"
            print(f"      {test_name}: {status}")
            results.append(f"{test_name}: {status}")
            if test_result:
                passed += 1

        summary = f"{passed}/4项通过"
        overall = passed == 4

        result = {
            'name': name,
            'domain': domain,
            'type': platform_type,
            'summary': summary,
            'overall': overall,
            'details': results
        }

        # 保存结果
        self.results[name] = result
        self._save_results()

        print(f"    📊 {self.name}: {name} 验证完成 - {summary}")
        return result

def run_simple_real_agents_fixed():
    """运行简单真实的agents"""
    print("🚀 简单真实Agents启动 (修复版)")
    print("🎯 Scout发现 → Validator真实验证")
    print("=" * 60)

    scout = ScoutRealAgent()
    validator = ValidatorRealAgent()

    cycle = 0
    try:
        while cycle < 50:
            cycle += 1
            print(f"\n🔄 第{cycle}轮")
            print("-" * 30)

            # Scout发现平台
            print(f"    🎯 Scout: 发现 3 个平台")
            platforms = scout.discover_platforms(3, validator.results.keys())

            if not platforms:
                print("    🔍 所有平台已验证完毕")
                break

            print(f"  📡 Scout发现:")
            for name, domain, ptype in platforms:
                print(f"    📍 {name} ({domain}) - {ptype}")

            # Validator验证平台
            print(f"\n  ✅ Validator验证:")
            passed_count = 0
            for name, domain, ptype in platforms:
                result = validator.validate_platform(name, domain, ptype)
                if result and result['overall']:
                    passed_count += 1

            print(f"\n📈 第{cycle}轮总结:")
            print(f"  ✅ 验证通过: {passed_count}/{len(platforms)} 个平台")

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n⏹️ Agents停止")

    print(f"\n🏆 最终统计:")
    passed_platforms = [p for p in validator.results.values() if p['overall']]
    print(f"  🎯 总计通过: {len(passed_platforms)} 个平台")

    for platform in passed_platforms:
        print(f"    🏆 {platform['name']} - {platform['summary']}")

if __name__ == "__main__":
    run_simple_real_agents_fixed()