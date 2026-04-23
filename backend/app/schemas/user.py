from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

# 用户统计请求模型
class UserStatsUpdate(BaseModel):
    study_time_today: Optional[int] = Field(None, description="今日学习时长(秒)")
    study_time_week: Optional[int] = Field(None, description="本周学习时长(秒)")
    study_time_month: Optional[int] = Field(None, description="本月学习时长(秒)")
    study_time_year: Optional[int] = Field(None, description="本年学习时长(秒)")
    study_time_total: Optional[int] = Field(None, description="总学习时长(秒)")
    word_count: Optional[int] = Field(None, description="学习单词总数")
    completed_lessons: Optional[int] = Field(None, description="已完成课时数")
    correct_answers: Optional[int] = Field(None, description="正确答案数")
    wrong_answers: Optional[int] = Field(None, description="错误答案数")
    xp_points: Optional[int] = Field(None, description="经验值")

# 本周打卡记录项
class WeeklyActivityDay(BaseModel):
    checked: bool
    isToday: bool

# 用户统计响应模型
class UserStatsResponse(BaseModel):
    id: str
    user_id: str
    streak: int
    total_check_in: int
    word_count: int
    study_time_today: int
    study_time_week: int
    study_time_month: int
    study_time_year: int
    study_time_total: int
    last_study_date: Optional[datetime] = None
    completed_lessons: int
    correct_answers: int
    wrong_answers: int
    accuracy: float
    xp_points: int
    level: int
    created_at: datetime
    updated_at: datetime
    weekly_activity: Optional[list[WeeklyActivityDay]] = None
    
    class Config:
        from_attributes = True

# 每日打卡响应模型
class CheckInResponse(BaseModel):
    success: bool
    message: str
    streak: int
    total_check_in: int
    is_new_check_in: bool

# 学习热力图数据响应模型
class HeatmapData(BaseModel):
    date: str
    count: int
    
class HeatmapResponse(BaseModel):
    data: list[HeatmapData]

# 最近学习记录响应模型
class RecentStudyRecord(BaseModel):
    id: str
    course_id: str
    course_name: str
    lesson_id: str
    lesson_name: str
    study_time: int
    last_studied_at: datetime
    is_completed: bool
    
class RecentStudiesResponse(BaseModel):
    records: list[RecentStudyRecord]
    total: int

# 用户设置模型
class UserSettingsResponse(BaseModel):
    id: str
    user_id: str
    appearance: Dict[str, Any]
    quiz: Dict[str, Any]
    playback: Dict[str, Any]
    listening: Dict[str, Any]
    speaking: Dict[str, Any]
    notifications: Dict[str, Any]
    sync: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 用户设置更新请求模型
class UserSettingsUpdate(BaseModel):
    appearance: Optional[Dict[str, Any]] = Field(None, description="外观设置")
    quiz: Optional[Dict[str, Any]] = Field(None, description="答题设置")
    playback: Optional[Dict[str, Any]] = Field(None, description="播放设置")
    listening: Optional[Dict[str, Any]] = Field(None, description="听力设置")
    speaking: Optional[Dict[str, Any]] = Field(None, description="口语设置")
    notifications: Optional[Dict[str, Any]] = Field(None, description="通知设置")
    sync: Optional[Dict[str, Any]] = Field(None, description="同步设置")
