class IssueTimersController < ApplicationController

  def index
  end

  def start
  end

  def resume
  end

  def suspend
  end

  def stop
  end

  def delete
  end

  def render_menu
    @project = Project.find_by_id(params[:project_id])
    @issue = Issue.find_by_id(params[:issue_id])
    render partial: 'embed_menu'
  end
end
