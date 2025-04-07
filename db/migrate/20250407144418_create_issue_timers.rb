class CreateIssueTimers < ActiveRecord::Migration[7.2]
  def change
    create_table :issue_timers do |t|
      t.integer :user_id
      t.integer :issue_id
      t.datetime :started_on
      t.integer :time_spent
      t.boolean :paused
    end
  end
end
