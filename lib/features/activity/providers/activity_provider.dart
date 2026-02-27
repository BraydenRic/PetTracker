import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../models/activity_model.dart';
import '../../../services/activity_service.dart';

part 'activity_provider.g.dart';

@riverpod
ActivityService activityService(Ref ref) => ActivityService();

@riverpod
Stream<List<ActivityModel>> activities(Ref ref, String petId, String ownerId) {
  return ref
      .watch(activityServiceProvider)
      .watchActivitiesForPet(petId, ownerId);
}
