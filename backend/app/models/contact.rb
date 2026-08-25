class Contact < ApplicationRecord
  belongs_to :account
  has_many :conversations, dependent: :destroy

  validates :igsid, presence: true, uniqueness: true
end
