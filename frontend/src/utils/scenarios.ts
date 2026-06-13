import type { Scenario } from '../types'

export const SCENARIOS: Scenario[] = [
  {
    id: 'maritime',
    name: '海事通讯',
    theme: 'maritime',
    icon: '🚢',
    description: '海上船舶通信标准用语，包括遇险呼叫、船位报告、航行警告等海事场景',
    tasks: [
      {
        id: 'mar-sos',
        title: 'SOS 遇险信号',
        text: 'SOS SOS SOS',
        description: '国际通用遇险呼叫信号，连续发送三次',
      },
      {
        id: 'mar-distress',
        title: 'MAYDAY 遇险呼叫',
        text: 'MAYDAY MAYDAY MAYDAY',
        description: '无线电紧急遇险呼叫，连呼三次以确认紧急状态',
      },
      {
        id: 'mar-ship-id',
        title: '船舶识别',
        text: 'SHIP MV PACIFIC STAR',
        description: '船舶自报船名与呼号格式',
      },
      {
        id: 'mar-position',
        title: '船位报告',
        text: 'POSITION LAT 35 N LONG 120 E',
        description: '标准经纬度船位报告格式',
      },
      {
        id: 'mar-weather',
        title: '气象通报',
        text: 'WEATHER STORM WARNING GALE FORCE 8',
        description: '海上气象预警通报标准格式',
      },
      {
        id: 'mar-nav',
        title: '航行警告',
        text: 'NAV WARNING SUBMERGED WRECK AT 32 N 118 W',
        description: '航行障碍物与危险区域警告',
      },
      {
        id: 'mar-anchorage',
        title: '锚泊报告',
        text: 'ANCHORED AT QUARANTINE ANCHORAGE',
        description: '船舶锚泊位置报告',
      },
      {
        id: 'mar-pilot',
        title: '引航请求',
        text: 'REQUIRE PILOT AT ENTRANCE BUOY',
        description: '请求引航员登船的标准用语',
      },
    ],
  },
  {
    id: 'rescue',
    name: '应急救援',
    theme: 'rescue',
    icon: '🚑',
    description: '搜救与紧急救援通信用语，包括协调搜救、医疗急救、撤离指令等救援场景',
    tasks: [
      {
        id: 'res-panpan',
        title: 'PAN PAN 紧急呼叫',
        text: 'PAN PAN PAN PAN PAN PAN',
        description: '紧急但非遇险呼叫信号，连发三次',
      },
      {
        id: 'res-medical',
        title: '医疗急救',
        text: 'MEDICAL EMERGENCY CREW INJURED',
        description: '船员受伤需紧急医疗援助',
      },
      {
        id: 'res-sar',
        title: '搜救协调',
        text: 'SAR OPERATION COMMENCE SEARCH PATTERN ALPHA',
        description: '搜救行动启动与搜索模式指定',
      },
      {
        id: 'res-evacuate',
        title: '撤离指令',
        text: 'ABANDON SHIP PROCEED TO LIFEBOAT STATION',
        description: '弃船撤离至救生艇站指令',
      },
      {
        id: 'res-survivor',
        title: '幸存者报告',
        text: 'SURVIVOR SIGHTED BEARING 045 RANGE 2 MILES',
        description: '发现幸存者的方位与距离报告',
      },
      {
        id: 'res-helicopter',
        title: '直升机救援',
        text: 'HELICOPTER RESCUE STANDBY FOR WINCH',
        description: '直升机绞车救援就位指令',
      },
      {
        id: 'res-fire',
        title: '火灾报告',
        text: 'FIRE IN ENGINE ROOM REQUEST IMMEDIATE ASSISTANCE',
        description: '机舱火灾紧急求援报告',
      },
      {
        id: 'res-onground',
        title: '搁浅报告',
        text: 'AGROUND ON SANDBANK WAITING FOR TIDE',
        description: '船舶搁浅与等待涨潮脱浅报告',
      },
    ],
  },
]
