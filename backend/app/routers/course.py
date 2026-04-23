from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
import uuid
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.course import Course, Lesson, UserLearningProgress, UserCourse
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse,
    LessonCreate, LessonUpdate, LessonResponse, LessonDetailResponse,
    LearningProgressUpdate, LearningProgressResponse, LearningProgressDetailResponse,
    UserCourseCreate, UserCourseUpdate, UserCourseResponse
)
from app.routers.auth import get_current_user_id
from app.models.user import User

router = APIRouter()

# 课程管理 API

# 创建课程
@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_data: CourseCreate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 这里可以添加权限验证，比如只有管理员可以创建课程
    
    course_id = f"course_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
    new_course = Course(
        id=course_id,
        **course_data.model_dump()
    )
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    return new_course

# 获取课程分类列表
@router.get("/categories")
def get_categories(
    db: Annotated[Session, Depends(get_db)]
):
    # 从所有课程中提取唯一的分类
    courses = db.query(Course).filter(Course.is_active == True).all()
    categories = {}
    
    for course in courses:
        if course.category:
            if course.category not in categories:
                categories[course.category] = {
                    "id": course.category,
                    "name": course.category,
                    "count": 1
                }
            else:
                categories[course.category]["count"] += 1
    
    # 如果没有分类，返回默认分类
    if not categories:
        return [
            {"id": "all", "name": "全部", "count": len(courses)},
            {"id": "official", "name": "官方课程", "count": 0},
            {"id": "nce", "name": "新概念英语", "count": 0}
        ]
    
    # 添加"全部"分类
    result = [{"id": "all", "name": "全部", "count": len(courses)}]
    result.extend(list(categories.values()))
    
    return result

# 获取课程列表
@router.get("/", response_model=List[CourseResponse])
def get_courses(
    db: Annotated[Session, Depends(get_db)],
    skip: int = 0,
    limit: int = 10,
    level: str = None,
    category: str = None,
    is_active: bool = True
):
    query = db.query(Course).filter(Course.is_active == is_active)
    
    if level:
        query = query.filter(Course.level == level)
    if category:
        query = query.filter(Course.category == category)
    
    return query.offset(skip).limit(limit).all()

# 用户课程（我的课程）管理 API

# 添加课程到我的课程
@router.post("/my-courses", response_model=UserCourseResponse, status_code=status.HTTP_201_CREATED)
def add_course_to_my_courses(
    course_data: UserCourseCreate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == course_data.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    
    # 检查课程是否已经在用户的课程列表中
    existing = db.query(UserCourse).filter(
        UserCourse.user_id == user_id,
        UserCourse.course_id == course_data.course_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="课程已经在我的课程列表中")
    
    # 创建新的用户课程关联
    new_user_course = UserCourse(
        user_id=user_id,
        course_id=course_data.course_id,
        tags=course_data.tags
    )
    
    db.add(new_user_course)
    db.commit()
    db.refresh(new_user_course)
    
    # 查询完整的课程信息
    user_course_response = {
        **new_user_course.__dict__,
        "course": course
    }
    
    return user_course_response

# 获取我的课程列表
@router.get("/my-courses", response_model=List[UserCourseResponse])
def get_my_courses(
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 查询用户的所有课程
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()
    
    # 获取完整的课程信息
    response = []
    for uc in user_courses:
        course = db.query(Course).filter(Course.id == uc.course_id).first()
        if course:
            response.append({
                **uc.__dict__,
                "course": course
            })
    
    return response

# 从我的课程中移除课程
@router.delete("/my-courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_course_from_my_courses(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 检查课程是否存在于用户的课程列表中
    user_course = db.query(UserCourse).filter(
        UserCourse.user_id == user_id,
        UserCourse.course_id == course_id
    ).first()
    
    if not user_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不在我的课程列表中")
    
    # 删除用户课程关联
    db.delete(user_course)
    db.commit()
    
    return None

# 更新我的课程标签
@router.put("/my-courses/{course_id}", response_model=UserCourseResponse)
def update_my_course_tags(
    course_id: str,
    update_data: UserCourseUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 检查课程是否存在于用户的课程列表中
    user_course = db.query(UserCourse).filter(
        UserCourse.user_id == user_id,
        UserCourse.course_id == course_id
    ).first()
    
    if not user_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不在我的课程列表中")
    
    # 更新标签
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(user_course, field, value)
    
    db.commit()
    db.refresh(user_course)
    
    # 查询完整的课程信息
    course = db.query(Course).filter(Course.id == user_course.course_id).first()
    
    user_course_response = {
        **user_course.__dict__,
        "course": course
    }
    
    return user_course_response

# 获取单个课程详情
@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    return course

# 更新课程
@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    course_data: CourseUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 这里可以添加权限验证，比如只有管理员可以更新课程
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    
    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return course

# 课时管理 API

# 创建课时
@router.post("/lessons", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(
    lesson_data: LessonCreate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 这里可以添加权限验证，比如只有管理员可以创建课时
    
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == lesson_data.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    
    lesson_id = f"lesson_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
    total_lines = len(lesson_data.content.lines)
    
    new_lesson = Lesson(
        id=lesson_id,
        course_id=lesson_data.course_id,
        lesson_number=lesson_data.lesson_number,
        title=lesson_data.title,
        content=lesson_data.content.model_dump(),
        total_lines=total_lines
    )
    
    db.add(new_lesson)
    
    # 更新课程总课时数
    course.total_lessons += 1
    
    db.commit()
    db.refresh(new_lesson)
    
    return new_lesson

# 获取课程的所有课时
@router.get("/{course_id}/lessons", response_model=List[LessonResponse])
def get_course_lessons(
    course_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    
    # 只选择需要的字段，避免查询大量的content数据
    lessons = db.query(
        Lesson.id,
        Lesson.course_id,
        Lesson.lesson_number,
        Lesson.title,
        Lesson.total_lines,
        Lesson.created_at,
        Lesson.updated_at
    ).filter(Lesson.course_id == course_id).order_by(Lesson.lesson_number).all()
    
    # 将查询结果转换为Lesson对象格式返回
    return [
        {
            "id": lesson.id,
            "course_id": lesson.course_id,
            "lesson_number": lesson.lesson_number,
            "title": lesson.title,
            "total_lines": lesson.total_lines,
            "created_at": lesson.created_at,
            "updated_at": lesson.updated_at
        }
        for lesson in lessons
    ]

# 获取课时详情
@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson(
    lesson_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课时不存在")
    return lesson

# 更新课时
@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: str,
    lesson_data: LessonUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 这里可以添加权限验证，比如只有管理员可以更新课时
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课时不存在")
    
    update_data = lesson_data.model_dump(exclude_unset=True)
    
    # 如果更新了内容，重新计算总行数
    if "content" in update_data:
        update_data["total_lines"] = len(update_data["content"]["lines"])
    
    for field, value in update_data.items():
        setattr(lesson, field, value)
    
    db.commit()
    db.refresh(lesson)
    return lesson

# 学习进度管理 API

# 更新学习进度
@router.post("/progress", response_model=LearningProgressResponse, status_code=status.HTTP_201_CREATED)
def update_learning_progress(
    progress_data: LearningProgressUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 检查课程和课时是否存在
    course = db.query(Course).filter(Course.id == progress_data.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    
    lesson = db.query(Lesson).filter(Lesson.id == progress_data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课时不存在")
    
    # 检查当前行是否超过课时总行数
    if progress_data.current_line > lesson.total_lines:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="当前行不能超过课时总行数")
    
    # 查找现有进度记录
    existing_progress = db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == user_id,
        UserLearningProgress.course_id == progress_data.course_id,
        UserLearningProgress.lesson_id == progress_data.lesson_id
    ).first()
    
    # 记录是否是新完成的课时
    was_completed_before = existing_progress.is_completed if existing_progress else False
    
    if existing_progress:
        # 更新现有进度
        existing_progress.current_line = progress_data.current_line
        existing_progress.last_studied_at = datetime.now()
        existing_progress.study_time += progress_data.study_time
        existing_progress.is_completed = progress_data.is_completed
        
        progress = existing_progress
    else:
        # 创建新进度记录
        progress_id = f"progress_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
        progress = UserLearningProgress(
            id=progress_id,
            user_id=user_id,
            course_id=progress_data.course_id,
            lesson_id=progress_data.lesson_id,
            current_line=progress_data.current_line,
            last_studied_at=datetime.now(),
            study_time=progress_data.study_time,
            is_completed=progress_data.is_completed
        )
        db.add(progress)
    
    # 更新用户统计数据
    from app.models.user import UserStats
    
    # 获取或创建用户统计记录
    user_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not user_stats:
        user_stats = UserStats(
            id=f"stats_{user_id}",
            user_id=user_id
        )
        db.add(user_stats)
    
    # 更新学习时长
    user_stats.study_time_total += progress_data.study_time
    
    # 获取今天、本周、本月、本年的开始时间
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    week_start = today - timedelta(days=today.weekday())
    week_start_datetime = datetime.combine(week_start, datetime.min.time())
    
    month_start = datetime(today.year, today.month, 1)
    year_start = datetime(today.year, 1, 1)
    
    # 更新今日学习时长
    if progress.last_studied_at >= today_start:
        user_stats.study_time_today += progress_data.study_time
    
    # 更新本周学习时长
    if progress.last_studied_at >= week_start_datetime:
        user_stats.study_time_week += progress_data.study_time
    
    # 更新本月学习时长
    if progress.last_studied_at >= month_start:
        user_stats.study_time_month += progress_data.study_time
    
    # 更新本年学习时长
    if progress.last_studied_at >= year_start:
        user_stats.study_time_year += progress_data.study_time
    
    # 更新最后学习日期
    user_stats.last_study_date = progress.last_studied_at
    
    # 更新连续学习天数和累计打卡
    if user_stats.last_study_date:
        last_date = user_stats.last_study_date.date()
        
        if last_date == today:
            # 今天已经学习过，不更新打卡记录
            pass
        else:
            yesterday = today - timedelta(days=1)
            if last_date == yesterday:
                # 连续学习，增加连胜天数
                user_stats.streak += 1
            else:
                # 中断了，重置连胜天数
                user_stats.streak = 1
            
            # 增加累计打卡次数
            user_stats.total_check_in += 1
    else:
        # 第一次学习
        user_stats.streak = 1
        user_stats.total_check_in = 1
    
    # 如果课时是新完成的，更新已完成课时数
    if progress_data.is_completed and not was_completed_before:
        user_stats.completed_lessons += 1
    
    db.commit()
    db.refresh(progress)
    
    return progress

# 获取用户课程学习进度
@router.get("/progress/course/{course_id}", response_model=List[LearningProgressResponse])
def get_course_progress(
    course_id: str,
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 检查课程是否存在
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在")
    
    return db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == user_id,
        UserLearningProgress.course_id == course_id
    ).all()

# 获取用户当前学习进度（最近学习的课程和课时）
@router.get("/progress/latest", response_model=LearningProgressDetailResponse)
def get_latest_progress(
    db: Annotated[Session, Depends(get_db)],
    user_id: str = Depends(get_current_user_id)
):
    # 查询用户的最新学习进度
    progress = db.query(UserLearningProgress).filter(
        UserLearningProgress.user_id == user_id
    ).order_by(UserLearningProgress.last_studied_at.desc()).first()
    
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="没有找到学习进度")
    
    # 查询对应的课程和课时信息
    course = db.query(Course).filter(Course.id == progress.course_id).first()
    lesson = db.query(Lesson).filter(Lesson.id == progress.lesson_id).first()
    
    if not course or not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="找不到对应的课程或课时")
    
    # 返回包含课程和课时信息的响应
    return {
        "id": progress.id,
        "user_id": progress.user_id,
        "course_id": progress.course_id,
        "lesson_id": progress.lesson_id,
        "current_line": progress.current_line,
        "is_completed": progress.is_completed,
        "last_studied_at": progress.last_studied_at,
        "study_time": progress.study_time,
        "created_at": progress.created_at,
        "updated_at": progress.updated_at,
        "course": course,
        "lesson": lesson
    }