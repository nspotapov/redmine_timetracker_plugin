class IssueTimer < ApplicationRecord
    def initialize
        self.user_id = User.current.id
        self.started_on = DateTime.now
        self.time_spent = 0
        self.paused = false
      end
end
