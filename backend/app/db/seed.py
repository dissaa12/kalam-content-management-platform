from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.category import Category
from app.models.tag import Tag
from app.models.campaign import Campaign
from app.models.content import Content
from app.models.seo_metadata import SEOMetadata
from app.core.security import get_password_hash

DEMO_ROLES = [
    {"name": "admin", "description": "Full access to all system resources and administration"},
    {"name": "marketing_manager", "description": "Manages marketing campaigns, content strategy, and analytics"},
    {"name": "content_editor", "description": "Edits, reviews, and approves content pieces"},
    {"name": "content_author", "description": "Creates and drafts new content items and uses AI Assistant"},
    {"name": "reviewer", "description": "Reviews content drafts and submits feedback"},
]

DEMO_CATEGORIES = [
    {"name": "Blog", "slug": "blog", "description": "Company articles, technical deep dives, and news"},
    {"name": "Landing Page", "slug": "landing-page", "description": "High converting campaign landing page copy"},
    {"name": "Email", "slug": "email", "description": "Newsletter sequences, product updates, and email copy"},
    {"name": "Social Media Post", "slug": "social-media-post", "description": "LinkedIn, Twitter, and social announcements"},
    {"name": "Advertisement", "slug": "advertisement", "description": "Search, display, and social ad copy"},
    {"name": "Case Study", "slug": "case-study", "description": "Enterprise customer success stories"},
    {"name": "Announcement", "slug": "announcement", "description": "Press releases and corporate announcements"},
]

DEMO_TAGS = [
    {"name": "AI", "slug": "ai"},
    {"name": "SaaS", "slug": "saas"},
    {"name": "B2B", "slug": "b2b"},
    {"name": "Growth", "slug": "growth"},
    {"name": "Automation", "slug": "automation"},
    {"name": "Security", "slug": "security"},
    {"name": "Compliance", "slug": "compliance"},
]

DEMO_USERS = [
    {"first_name": "Elena", "last_name": "Rostova", "email": "admin@enterprise.com", "password": "Admin123!", "role": "admin"},
    {"first_name": "Sarah", "last_name": "Jenkins", "email": "manager@enterprise.com", "password": "Manager123!", "role": "marketing_manager"},
    {"first_name": "Alex", "last_name": "Rivera", "email": "editor@enterprise.com", "password": "Editor123!", "role": "content_editor"},
    {"first_name": "Devon", "last_name": "Vance", "email": "author@enterprise.com", "password": "Author123!", "role": "content_author"},
    {"first_name": "Marcus", "last_name": "Chen", "email": "reviewer@enterprise.com", "password": "Reviewer123!", "role": "reviewer"},
]

now = datetime.utcnow()
DEMO_CAMPAIGNS = [
    {
        "name": "Q4 Enterprise AI Growth",
        "description": "Multi-channel campaign focused on scaling B2B SaaS marketing pipelines.",
        "objective": "Generate 1,500 enterprise MQLs in Q4",
        "target_audience": "VP Marketing, CMOs, Enterprise Tech Directors",
        "campaign_type": "lead_generation",
        "start_date": now - timedelta(days=15),
        "end_date": now + timedelta(days=45),
        "budget": 45000.0,
        "status": "active",
        "owner_email": "manager@enterprise.com",
    },
    {
        "name": "Autumn Thought Leadership Summit",
        "description": "Executive webinar and whitepaper series on AI governance.",
        "objective": "Position company as #1 enterprise content AI platform",
        "target_audience": "C-Suite, IT Directors, Compliance Officers",
        "campaign_type": "brand_awareness",
        "start_date": now - timedelta(days=5),
        "end_date": now + timedelta(days=25),
        "budget": 28000.0,
        "status": "active",
        "owner_email": "manager@enterprise.com",
    },
    {
        "name": "OmniContent 3.0 Launch Blast",
        "description": "Product launch campaign across social, email, and press channels.",
        "objective": "Drive 10,000 product signup leads",
        "target_audience": "Digital Marketers, Content Managers",
        "campaign_type": "product_launch",
        "start_date": now + timedelta(days=10),
        "end_date": now + timedelta(days=40),
        "budget": 60000.0,
        "status": "planning",
        "owner_email": "admin@enterprise.com",
    },
]

DEMO_CONTENT = [
    {
        "title": "2026 Enterprise AI Content Operations Strategy",
        "slug": "2026-enterprise-ai-content-operations-strategy",
        "content_type": "blog",
        "category_slug": "blog",
        "campaign_name": "Q4 Enterprise AI Growth",
        "status": "published",
        "excerpt": "A comprehensive executive guide to structuring multi-channel AI content governance.",
        "body": "# 2026 Enterprise AI Content Strategy\n\nModern enterprise marketing organizations are undergoing a massive transformation...",
        "author_email": "manager@enterprise.com",
        "scheduled_at": now - timedelta(days=2),
    },
    {
        "title": "Q4 B2B Acquisition Growth Campaign Landing Page",
        "slug": "q4-b2b-acquisition-growth-landing-page",
        "content_type": "landing_page",
        "category_slug": "landing-page",
        "campaign_name": "Q4 Enterprise AI Growth",
        "status": "in_review",
        "excerpt": "High conversion hero headline, value props, and enterprise CTA.",
        "body": "# Accelerate Enterprise Content Workflows\n\nScale your marketing pipeline 10x with automated AI governance.",
        "author_email": "author@enterprise.com",
        "scheduled_at": now + timedelta(days=3),
    },
    {
        "title": "Customer Spotlight: How Acme Corp Scaled Leads 300%",
        "slug": "customer-spotlight-how-acme-corp-scaled-leads-300-percent",
        "content_type": "case_study",
        "category_slug": "case-study",
        "campaign_name": "Autumn Thought Leadership Summit",
        "status": "approved",
        "excerpt": "Discover how Acme Corp leveraged OmniContent AI to reduce review cycles by 65%.",
        "body": "# Acme Corp Case Study\n\nAcme Corp needed a centralized content management hub...",
        "author_email": "editor@enterprise.com",
        "scheduled_at": now + timedelta(days=5),
    },
    {
        "title": "Announcing OmniContent AI 3.0 Platform Release",
        "slug": "announcing-omnicontent-ai-3-0-platform-release",
        "content_type": "announcement",
        "category_slug": "announcement",
        "campaign_name": "OmniContent 3.0 Launch Blast",
        "status": "scheduled",
        "excerpt": "Introducing AI assistant workflows, real-time collaboration, and enhanced SOC2 controls.",
        "body": "# OmniContent 3.0 Press Release\n\nSAN FRANCISCO, CA — OmniContent today announced general availability...",
        "author_email": "admin@enterprise.com",
        "scheduled_at": now + timedelta(days=12),
    },
]


def seed_database(db: Session):
    Base.metadata.create_all(bind=engine)

    # Seed Roles
    role_map = {}
    for r_data in DEMO_ROLES:
        role = db.query(Role).filter(Role.name == r_data["name"]).first()
        if not role:
            role = Role(name=r_data["name"], description=r_data["description"])
            db.add(role)
            db.commit()
            db.refresh(role)
        role_map[role.name] = role

    # Seed Categories
    cat_map = {}
    for c_data in DEMO_CATEGORIES:
        cat = db.query(Category).filter(Category.slug == c_data["slug"]).first()
        if not cat:
            cat = Category(name=c_data["name"], slug=c_data["slug"], description=c_data["description"])
            db.add(cat)
            db.commit()
            db.refresh(cat)
        cat_map[cat.slug] = cat

    # Seed Tags
    tag_map = {}
    for t_data in DEMO_TAGS:
        tag = db.query(Tag).filter(Tag.slug == t_data["slug"]).first()
        if not tag:
            tag = Tag(name=t_data["name"], slug=t_data["slug"])
            db.add(tag)
            db.commit()
            db.refresh(tag)
        tag_map[tag.slug] = tag

    # Seed Users
    user_map = {}
    for u_data in DEMO_USERS:
        user = db.query(User).filter(User.email == u_data["email"]).first()
        if not user:
            user = User(
                first_name=u_data["first_name"],
                last_name=u_data["last_name"],
                email=u_data["email"],
                password_hash=get_password_hash(u_data["password"]),
                role=u_data["role"],
                is_active=True,
            )
            role_obj = role_map.get(u_data["role"])
            if role_obj:
                user.roles_list.append(role_obj)
            db.add(user)
            db.commit()
            db.refresh(user)
        user_map[user.email] = user

    # Seed Campaigns
    campaign_map = {}
    for cmp_data in DEMO_CAMPAIGNS:
        cmp_obj = db.query(Campaign).filter(Campaign.name == cmp_data["name"]).first()
        if not cmp_obj:
            owner = user_map.get(cmp_data["owner_email"])
            cmp_obj = Campaign(
                name=cmp_data["name"],
                description=cmp_data["description"],
                objective=cmp_data["objective"],
                target_audience=cmp_data["target_audience"],
                campaign_type=cmp_data["campaign_type"],
                start_date=cmp_data["start_date"],
                end_date=cmp_data["end_date"],
                budget=cmp_data["budget"],
                owner_id=owner.id if owner else 1,
                status=cmp_data["status"],
            )
            db.add(cmp_obj)
            db.commit()
            db.refresh(cmp_obj)
        campaign_map[cmp_obj.name] = cmp_obj

    # Seed Content Items
    for cnt_data in DEMO_CONTENT:
        cnt = db.query(Content).filter(Content.slug == cnt_data["slug"]).first()
        author = user_map.get(cnt_data["author_email"])
        category = cat_map.get(cnt_data["category_slug"])
        campaign = campaign_map.get(cnt_data["campaign_name"])

        if not cnt:
            cnt = Content(
                title=cnt_data["title"],
                slug=cnt_data["slug"],
                content_type=cnt_data["content_type"],
                category_id=category.id if category else None,
                campaign_id=campaign.id if campaign else None,
                status=cnt_data["status"],
                excerpt=cnt_data["excerpt"],
                body=cnt_data["body"],
                author_id=author.id if author else 1,
                scheduled_at=cnt_data["scheduled_at"],
                published_at=datetime.utcnow() if cnt_data["status"] == "published" else None,
            )
            cnt.tags.extend(list(tag_map.values())[:3])
            cnt.seo_metadata = SEOMetadata(
                meta_title=cnt_data["title"],
                meta_description=cnt_data["excerpt"],
            )
            db.add(cnt)
            db.commit()
        else:
            if campaign and not cnt.campaign_id:
                cnt.campaign_id = campaign.id
                cnt.scheduled_at = cnt_data["scheduled_at"]
                db.commit()

    print("Database seeding completed with Phase 5 campaign data!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
