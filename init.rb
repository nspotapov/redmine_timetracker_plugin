require File.dirname(__FILE__) + '/lib/redmine_timetracker_plugin/hooks.rb'

Redmine::Plugin.register :redmine_timetracker_plugin do
  name 'Redmine Timetracker Plugin'
  author 'Nikita Potapov'
  description 'This is a time tracker plugin for Redmine'
  version '0.0.1'
  url 'https://github.com/nspotapov/redmine_timetracker_plugin'
  author_url 'ns.potapov@yandex.ru'
end
