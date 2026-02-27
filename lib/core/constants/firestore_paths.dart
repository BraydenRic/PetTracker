abstract final class FirestorePaths {
  static const users = 'users';
  static const pets = 'pets';
  static const activities = 'activities';

  static String user(String uid) => '$users/$uid';
  static String pet(String petId) => '$pets/$petId';
  static String activity(String activityId) => '$activities/$activityId';
}
