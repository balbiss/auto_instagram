class Account < ApplicationRecord
  MAX_INSTAGRAM_ACCOUNTS = 2

  has_many :users, dependent: :destroy
  has_many :instagram_accounts, dependent: :destroy
  has_many :contacts, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :automation_rules, dependent: :destroy
  has_many :flows, dependent: :destroy

  validates :name, presence: true
end
