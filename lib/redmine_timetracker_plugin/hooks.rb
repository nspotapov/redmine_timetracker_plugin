module RedmineTimetrackerPlugin
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_body_bottom(context)
      javascript_include_tag('redmine_timetracker_plugin', plugin: :redmine_timetracker_plugin)
    end

    def view_layouts_base_html_head(context)
      stylesheet_link_tag('redmine_timetracker_plugin.css', plugin: :redmine_timetracker_plugin)
    end
  end
end
