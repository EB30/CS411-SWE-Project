"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('', views.ping),
    path('search/', views.ping ),
    path('search/<slug:recipe_query>', views.search),
    path('search/<slug:recipe_query>/<int:page_num>', views.search),
    path('information/<int:info_query>', views.information),
    path('start_auth/', views.start_query),
    path('authorize/', views.auth),
    path('create_tasks/', views.create_list),
    path('add_review/', views.add_review),
    path('get_reviews/<int:recipe_id>', views.get_reviews)
]
