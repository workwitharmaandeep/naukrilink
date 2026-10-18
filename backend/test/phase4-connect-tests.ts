import assert from 'assert';

/**
 * Phase 4 Connect & Manage Unit Tests
 * Testing:
 * 1. Application Lifecycle State Machine & Transition Rules
 * 2. Mentorship Capacity Invariants, Booking & Cancellation
 * 3. Notification Dispatch & Status Update Integrity
 */

async function runPhase4Tests() {
  console.log('🧪 Running NEXAURA Phase 4 Connect & Manage Unit Tests...\n');

  // -------------------------------------------------------------
  // Test 1: Application State Machine & Status History Invariants
  // -------------------------------------------------------------
  console.log('▶ Test 1: Application Lifecycle Transitions & Validation');

  type ApplicationStatus =
    | 'APPLIED'
    | 'UNDER_REVIEW'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'OFFERED'
    | 'REJECTED'
    | 'WITHDRAWN';

  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    APPLIED: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
    UNDER_REVIEW: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    SHORTLISTED: ['INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'WITHDRAWN'],
    INTERVIEW_SCHEDULED: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
    OFFERED: ['REJECTED', 'WITHDRAWN'],
    REJECTED: [],
    WITHDRAWN: [],
  };

  function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  assert.strictEqual(canTransition('APPLIED', 'UNDER_REVIEW'), true, 'APPLIED can transition to UNDER_REVIEW');
  assert.strictEqual(canTransition('UNDER_REVIEW', 'SHORTLISTED'), true, 'UNDER_REVIEW can transition to SHORTLISTED');
  assert.strictEqual(canTransition('SHORTLISTED', 'INTERVIEW_SCHEDULED'), true, 'SHORTLISTED can transition to INTERVIEW_SCHEDULED');
  assert.strictEqual(canTransition('INTERVIEW_SCHEDULED', 'OFFERED'), true, 'INTERVIEW_SCHEDULED can transition to OFFERED');
  assert.strictEqual(canTransition('REJECTED', 'OFFERED'), false, 'REJECTED cannot transition to OFFERED');
  assert.strictEqual(canTransition('WITHDRAWN', 'SHORTLISTED'), false, 'WITHDRAWN cannot transition to SHORTLISTED');

  console.log('✅ Application state machine validated.\n');

  // -------------------------------------------------------------
  // Test 2: In-App Notification Dispatch on Status Change
  // -------------------------------------------------------------
  console.log('▶ Test 2: Notification Payload Generation on Status Change');

  function generateStatusUpdateNotification(
    companyName: string,
    internshipTitle: string,
    newStatus: ApplicationStatus,
    notes?: string
  ) {
    return {
      title: `Application ${newStatus}: ${internshipTitle}`,
      message: `${companyName} updated your application status to ${newStatus}.${
        notes ? ` Note: "${notes}"` : ''
      }`,
      type: 'APPLICATION_UPDATE',
      linkUrl: '/student/applications',
    };
  }

  const notif = generateStatusUpdateNotification(
    'Acme Cloud Corp',
    'Full Stack React Intern',
    'SHORTLISTED',
    'Great quiz score!'
  );

  assert.strictEqual(notif.title, 'Application SHORTLISTED: Full Stack React Intern');
  assert.ok(notif.message.includes('Acme Cloud Corp'));
  assert.ok(notif.message.includes('Note: "Great quiz score!"'));
  assert.strictEqual(notif.type, 'APPLICATION_UPDATE');
  assert.strictEqual(notif.linkUrl, '/student/applications');

  console.log('✅ Notification payload generation verified.\n');

  // -------------------------------------------------------------
  // Test 3: Mentorship Slot Capacity & Double Booking Protection
  // -------------------------------------------------------------
  console.log('▶ Test 3: Mentorship Slot Capacity & Booking Invariants');

  interface MockSlot {
    id: string;
    startTime: Date;
    capacity: number;
    bookedCount: number;
  }

  interface MockEnrolment {
    slotId: string;
    studentId: string;
    status: 'ENROLLED' | 'CANCELLED';
  }

  function validateBooking(
    slot: MockSlot,
    existingEnrolments: MockEnrolment[],
    studentId: string
  ): { allowed: boolean; errorCode?: string } {
    if (new Date() > slot.startTime) {
      return { allowed: false, errorCode: 'SLOT_EXPIRED' };
    }

    if (slot.bookedCount >= slot.capacity) {
      return { allowed: false, errorCode: 'SLOT_FULL' };
    }

    const alreadyEnrolled = existingEnrolments.some(
      (e) => e.slotId === slot.id && e.studentId === studentId && e.status === 'ENROLLED'
    );
    if (alreadyEnrolled) {
      return { allowed: false, errorCode: 'ALREADY_ENROLLED' };
    }

    return { allowed: true };
  }

  const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
  const pastTime = new Date(Date.now() - 60 * 60 * 1000); // -1 hour

  // Test expired slot
  const expiredSlot: MockSlot = { id: 's1', startTime: pastTime, capacity: 5, bookedCount: 0 };
  assert.strictEqual(
    validateBooking(expiredSlot, [], 'student-1').errorCode,
    'SLOT_EXPIRED',
    'Must reject booking for expired slots'
  );

  // Test full slot
  const fullSlot: MockSlot = { id: 's2', startTime: futureTime, capacity: 2, bookedCount: 2 };
  assert.strictEqual(
    validateBooking(fullSlot, [], 'student-1').errorCode,
    'SLOT_FULL',
    'Must reject booking when capacity is reached'
  );

  // Test already enrolled student
  const openSlot: MockSlot = { id: 's3', startTime: futureTime, capacity: 5, bookedCount: 1 };
  const enrolments: MockEnrolment[] = [{ slotId: 's3', studentId: 'student-1', status: 'ENROLLED' }];
  assert.strictEqual(
    validateBooking(openSlot, enrolments, 'student-1').errorCode,
    'ALREADY_ENROLLED',
    'Must reject double booking for same slot'
  );

  // Test valid booking
  const validBooking = validateBooking(openSlot, enrolments, 'student-2');
  assert.strictEqual(validBooking.allowed, true, 'Must allow valid booking with capacity');

  console.log('✅ Mentorship booking invariants verified.\n');

  // -------------------------------------------------------------
  // Test 4: Mentorship Slot Cancellation & Inventory Reclamation
  // -------------------------------------------------------------
  console.log('▶ Test 4: Mentorship Slot Cancellation & Inventory Reclamation');

  function bookSlotMutation(slot: MockSlot): MockSlot {
    assert.ok(slot.bookedCount < slot.capacity, 'Cannot book over capacity');
    return { ...slot, bookedCount: slot.bookedCount + 1 };
  }

  function cancelSlotMutation(slot: MockSlot, enrolment: MockEnrolment): { slot: MockSlot; enrolment: MockEnrolment } {
    assert.strictEqual(enrolment.status, 'ENROLLED', 'Can only cancel active enrolment');
    assert.ok(slot.bookedCount > 0, 'Booked count must be greater than zero to decrement');
    return {
      slot: { ...slot, bookedCount: slot.bookedCount - 1 },
      enrolment: { ...enrolment, status: 'CANCELLED' },
    };
  }

  let testSlot: MockSlot = { id: 'slot-4', startTime: futureTime, capacity: 3, bookedCount: 1 };
  testSlot = bookSlotMutation(testSlot);
  assert.strictEqual(testSlot.bookedCount, 2, 'Booking slot increments bookedCount to 2');

  let activeEnrolment: MockEnrolment = { slotId: 'slot-4', studentId: 'student-99', status: 'ENROLLED' };
  const cancellationResult = cancelSlotMutation(testSlot, activeEnrolment);
  assert.strictEqual(cancellationResult.slot.bookedCount, 1, 'Cancellation decrements bookedCount back to 1');
  assert.strictEqual(cancellationResult.enrolment.status, 'CANCELLED', 'Enrolment status updated to CANCELLED');

  console.log('✅ Mentorship cancellation and inventory reclamation verified.\n');

  console.log('🎉 All Phase 4 Connect & Manage Unit Tests Passed Successfully!\n');
}

runPhase4Tests().catch((err) => {
  console.error('❌ Phase 4 tests failed:', err);
  process.exit(1);
});
