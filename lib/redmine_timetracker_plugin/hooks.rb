module RedmineTimetrackerPlugin
  class Hooks < Redmine::Hook::ViewListener
    render_on(:view_layouts_base_body_bottom, :partial => 'redmine_timetracker_plugin/embed_menu')

    def view_layouts_base_html_head(context)
      stylesheet_link_tag('redmine_timetracker_plugin.css', plugin: :redmine_timetracker_plugin)
    end
  end
end
