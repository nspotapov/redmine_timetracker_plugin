# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

Rails.application.routes.draw do
    match 'issue_timers/render_menu', to: 'issue_timers#render_menu', via: %i[get]
    match 'issue_timers', to: 'issue_timers#index', via: %i[get]
    match 'issue_timers/start', to: 'issue_timers#start', via: %i[post]
    match 'issue_timers/resume', to: 'issue_timers#resume', via: %i[post]
    match 'issue_timers/suspend', to: 'issue_timers#suspend', via: %i[post]
    match 'issue_timers/stop', to: 'issue_timers#stop', via: %i[post]
    match 'issue_timers/delete', to: 'issue_timers#delete', via: %i[post]
  end
