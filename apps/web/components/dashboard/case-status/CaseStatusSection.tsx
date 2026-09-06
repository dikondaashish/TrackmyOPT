'use client';

import { Card } from '@/components/ui/card';
import { PricingModal } from '@/components/pricing/PricingModal';
import { CaseStatusPanelErrorBoundary } from "@/components/dashboard/case-status/CaseTimelineErrorBoundary";
import {
  CaseStatusLoading,
  DeleteNoticeBanner,
  LoadErrorBanner,
  RefreshFailedBanner,
  UscisMockModeBadge,
} from "@/components/dashboard/case-status/CaseStatusSectionNotices";
import { CaseStatusActiveNotices } from "@/components/dashboard/case-status/CaseStatusActiveNotices";
import { CaseStatusDeleteDialog } from "@/components/dashboard/case-status/CaseStatusDeleteDialog";
import { CaseStatusTimelineAndInfo } from "@/components/dashboard/case-status/CaseStatusTimelineAndInfo";
import { PACKAGING_NOTICE_DISMISS_KEY } from "@/components/dashboard/case-status/case-status-section-helpers";
import { daysSinceEpochMs, formatDisplayDateTime } from "@/lib/case-status/safe-dates";
import { UscisCaseStatusDisclaimer } from "@/components/legal/UscisCaseStatusDisclaimer";
import { CaseStatusPageViewTracker } from "@/components/analytics/CaseStatusPageViewTracker";
import { normalizeFilingCategory } from '@/lib/case-status/filing-category';
import { PremiumProcessingCountdown } from '@/components/dashboard/case-status/PremiumProcessingCountdown';
import { CaseStatusReceiptPanel } from '@/components/dashboard/case-status/CaseStatusReceiptPanel';
import { ManualRefreshUpsellPrompt } from '@/components/dashboard/case-status/ManualRefreshUpsellPrompt';
import { CaseInsightUpgradeDialog } from '@/components/dashboard/case-status/CaseInsightUpgradeDialog';
import { CHECKOUT_UPSELL_TRIGGER } from "@/lib/case-status/free-change-wedge";
import { StickyCaseSwitcher, deriveCaseState } from "@/components/dashboard/case-status/panels/StickyCaseSwitcher";
import { UrgentActionBanner } from "@/components/dashboard/case-status/panels/UrgentActionBanner";
import { CaseHeroCard } from "@/components/dashboard/case-status/panels/CaseHeroCard";
import { MonitorHealthStrip } from "@/components/dashboard/case-status/panels/MonitorHealthStrip";
import { AnalyticsTabs } from "@/components/dashboard/case-status/panels/AnalyticsTabs";
import { ToolsAccordion } from "@/components/dashboard/case-status/panels/ToolsAccordion";
import { CaseActionCenter } from "@/components/dashboard/case-status/panels/CaseActionCenter";
import { DedicatedConsultationCard } from "@/components/dashboard/case-status/panels/DedicatedConsultationCard";
import { OptJourneySection } from "@/components/dashboard/case-status/panels/OptJourneySection";
import { CaseInfoFooter } from "@/components/dashboard/case-status/panels/CaseInfoFooter";
import { CASE_STATUS_MESSAGING } from "@/lib/messaging/product-copy";
import { deriveJourneyPhase } from "@/lib/community-opt/stages";
import { useCaseStatusController } from "@/components/dashboard/case-status/useCaseStatusController";

export function CaseStatusSection() {
  const {
    isInitialLoad,
    caseState,
    ppOverdueDays,
    ppDeadlineDate,
    daysSinceFiled,
    serviceCenterLocation,
    isOptCase,
    isStemExtension,
    formTypeMismatch,
    showFilingCategoryPrompt,
    rfeDate,
    safeStatusHistory,
    showPackagingNotice,
    proUpgradeCta,
    nextCheckAt,
    clientNowMs,
    deleteNotice,
    caseStatus,
    loadError,
    receiptNumber,
    filingCategory,
    isSaving,
    isPolling,
    error,
    success,
    trackedCases,
    selectedCaseId,
    isRemoving,
    canAddMoreCases,
    showStatusChangeWedge,
    isPremium,
    filingCategorySaving,
    filingCategoryPromptKey,
    isEditingReceipt,
    isRefreshing,
    notificationEmail,
    communityPrediction,
    communitySummary,
    communityStages,
    communityHeatmap,
    communityWeeklyTrend,
    communityHistogram,
    communitySimilarFiling,
    communityEstimateLoading,
    filingDateInput,
    filingDateSaving,
    isEditingEmail,
    emailSaving,
    showManualRefreshUpsell,
    showStaleStatusUpsell,
    casePendingDelete,
    showCaseInsightUpgrade,
    proIntroEligible,
    showPricingModal,
    pricingModalPlan,
    setLoadError,
    setReceiptNumber,
    setFilingCategory,
    setPackagingNoticeDismissed,
    setWedgeDismissed,
    setCaseStatus,
    setFilingCategoryPromptDismissed,
    setIsEditingReceipt,
    setError,
    setSuccess,
    setIsEditingEmail,
    setFilingDateInput,
    setNotificationEmail,
    setShowManualRefreshUpsell,
    setShowStaleStatusUpsell,
    setCasePendingDelete,
    setShowCaseInsightUpgrade,
    setShowPricingModal,
    loadCaseStatus,
    handleSave,
    selectCase,
    requestDeleteCase,
    handleStartAddCase,
    openProTrialModal,
    handleFilingCategoryUpdate,
    handleRefresh,
    handleRemove,
    openDedicatedModal,
    handleSaveFilingDate,
    toggleNotifications,
    handleEmailSave,
    confirmDeleteCase,
  } = useCaseStatusController();

  if (isInitialLoad) {
    return <CaseStatusLoading />;
  }

  return (
    <div className="space-y-5">
      <CaseStatusPageViewTracker
        isInitialLoadComplete={!isInitialLoad}
        hasReceipt={Boolean(caseStatus?.receipt_number)}
        hasStatus={Boolean(caseStatus?.current_status)}
        currentStatus={caseStatus?.current_status ?? null}
      />
      {/* Minimal page title — no marketing copy */}
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">USCIS Case Status</h1>

      {/* ── Delete success banner ── */}
      {deleteNotice && <DeleteNoticeBanner message={deleteNotice} />}

      {/* ── Load error (no case) ── */}
      {!caseStatus && loadError && (
        <LoadErrorBanner
          message={loadError}
          onRetry={() => {
            setLoadError(null);
            void loadCaseStatus(true);
          }}
        />
      )}

      {/* ── Onboarding (no case yet) ── */}
      {!caseStatus && !loadError && (
        <CaseStatusReceiptPanel
          mode="onboarding"
          receiptNumber={receiptNumber}
          filingCategory={filingCategory}
          onReceiptChange={setReceiptNumber}
          onFilingCategoryChange={setFilingCategory}
          onSave={handleSave}
          isSaving={isSaving}
          isPolling={isPolling}
          error={error}
          success={success}
        />
      )}

      {caseStatus && (
        <>
          {/* ── 1. STICKY CASE SWITCHER ── */}
          {trackedCases.length > 0 && (
            <StickyCaseSwitcher
              cases={trackedCases.map((c) => ({
                id: c.id,
                receiptNumber: c.receipt_number,
                formType: c.case_type ?? null,
                filingCategory: c.filing_category ?? null,
                caseState: deriveCaseState(c.current_status),
                isPrimary: c.is_primary,
              }))}
              selectedId={selectedCaseId ?? caseStatus.id}
              onSelect={selectCase}
              onDeleteCase={requestDeleteCase}
              deletingCaseId={isRemoving}
              onAddCase={handleStartAddCase}
              canAddMore={canAddMoreCases}
            />
          )}

          {/* ── 2. URGENT ACTION BANNER ── */}
          <UrgentActionBanner
            caseState={caseState}
            premiumProcessing={
              ppOverdueDays > 0 && ppDeadlineDate
                ? { overdueBusinessDays: ppOverdueDays, deadlineDate: ppDeadlineDate }
                : undefined
            }
            rfeDate={rfeDate}
          />

          {/* ── 2b–2c / trial / filing / mismatch notices ── */}
          <CaseStatusActiveNotices
            showPackagingNotice={showPackagingNotice}
            packagingMessage={CASE_STATUS_MESSAGING.packagingChangeNotice}
            proUpgradeCta={proUpgradeCta}
            onUpgrade={() => openProTrialModal()}
            onDismissPackaging={() => {
              setPackagingNoticeDismissed(true);
              try {
                window.localStorage.setItem(PACKAGING_NOTICE_DISMISS_KEY, "1");
              } catch {
                /* ignore */
              }
            }}
            showStatusChangeWedge={showStatusChangeWedge}
            statusLastChangedAt={caseStatus.status_last_changed_at}
            onWedgeAcknowledged={() => {
              setWedgeDismissed(true);
              setCaseStatus((prev) =>
                prev ? { ...prev, last_status_viewed_at: new Date().toISOString() } : prev
              );
            }}
            isPremium={isPremium}
            trialMessage={CASE_STATUS_MESSAGING.trialCtaStrip}
            showFilingCategoryPrompt={showFilingCategoryPrompt}
            filingCategorySaving={filingCategorySaving}
            onConfirmFilingCategory={(category) =>
              void handleFilingCategoryUpdate(category, "confirm_banner")
            }
            onDismissFilingCategory={() => {
              if (filingCategoryPromptKey) {
                sessionStorage.setItem(filingCategoryPromptKey, "1");
              }
              setFilingCategoryPromptDismissed(true);
            }}
            formTypeMismatch={formTypeMismatch}
          />

          {/* ── 3. MAIN CASE HERO CARD ── */}
          {isEditingReceipt ? (
            <CaseStatusReceiptPanel
              mode="edit"
              receiptNumber={receiptNumber}
              filingCategory={filingCategory}
              onReceiptChange={setReceiptNumber}
              onFilingCategoryChange={setFilingCategory}
              onSave={handleSave}
              isSaving={isSaving}
              isPolling={isPolling}
              error={error}
              success={success}
              onCancelEdit={() => {
                setIsEditingReceipt(false);
                setReceiptNumber(caseStatus.receipt_number);
                setFilingCategory(normalizeFilingCategory(caseStatus.filing_category));
                setError(null);
                setSuccess(false);
              }}
            />
          ) : (
            <CaseStatusPanelErrorBoundary area="hero">
              <CaseHeroCard
                caseStatus={{ ...caseStatus, status_history: safeStatusHistory }}
                caseState={caseState}
                ppOverdueDays={ppOverdueDays}
                ppDeadlineDate={ppDeadlineDate}
                updateCount={safeStatusHistory.length}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onManageCase={() => {
                  setIsEditingReceipt(true);
                  setReceiptNumber(caseStatus.receipt_number);
                  setFilingCategory(normalizeFilingCategory(caseStatus.filing_category));
                }}
                onDelete={handleRemove}
                isDeleting={isRemoving === caseStatus.id}
                refreshError={error}
              />
            </CaseStatusPanelErrorBoundary>
          )}

          {/* ── 3a. CASE ACTION CENTER ── */}
          <CaseStatusPanelErrorBoundary area="case_action_center">
            <CaseActionCenter
              statusText={caseStatus.current_status}
              daysSinceFiled={daysSinceFiled}
            />
          </CaseStatusPanelErrorBoundary>

          <CaseStatusPanelErrorBoundary area="dedicated_consultation">
            <DedicatedConsultationCard
              caseId={caseStatus.id}
              onCompareDedicated={openDedicatedModal}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 3b. Refresh failed inline warning ── */}
          {caseStatus.last_check_failed_at && (caseStatus.consecutive_failures ?? 0) > 0 && (
            <RefreshFailedBanner
              message={
                isPremium === true
                  ? `Last auto-check failed (${formatDisplayDateTime(caseStatus.last_check_failed_at)}). USCIS may be unreachable — we will keep retrying.`
                  : `Last check failed (${formatDisplayDateTime(caseStatus.last_check_failed_at)}). Try a manual refresh, or upgrade to Pro for daily auto-checks.`
              }
            />
          )}

          {/* ── 4. MONITOR HEALTH STRIP ── */}
          <CaseStatusPanelErrorBoundary area="monitor_health">
            <MonitorHealthStrip
              monitorActive={isPremium === true}
              lastCheckedAt={caseStatus.last_checked_at}
              nextCheckAt={nextCheckAt}
              emailAlertsEnabled={caseStatus.notifications_enabled}
              emailAddress={notificationEmail}
              onEditEmail={() => setIsEditingEmail(true)}
              onUpgrade={
                isPremium === false ? () => openProTrialModal() : undefined
              }
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 4b. PP Countdown (keep existing component) ── */}
          <CaseStatusPanelErrorBoundary area="pp_countdown">
            <PremiumProcessingCountdown
              caseId={caseStatus.id}
              ppStartDate={caseStatus.pp_start_date ?? null}
              currentStatus={caseStatus.current_status}
              statusHistory={safeStatusHistory}
              onSaved={() => void loadCaseStatus()}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 5. ANALYTICS SECTION ── */}
          <Card className="p-5 sm:p-6 border-0 shadow-lg">
            <CaseStatusPanelErrorBoundary area="analytics">
              <AnalyticsTabs
                receiptNumber={caseStatus.receipt_number}
                isPremium={isPremium}
                onUpgrade={() => openProTrialModal()}
                daysSinceFiled={daysSinceFiled ?? 0}
                prediction={communityPrediction ?? undefined}
                summary={communitySummary}
                stages={communityStages}
                phase={deriveJourneyPhase(caseStatus.current_status)}
                heatmap={communityHeatmap}
                weeklyTrend={communityWeeklyTrend}
                histogram={communityHistogram}
                similarFiling={communitySimilarFiling}
                receivedDate={caseStatus.received_date}
                premiumProcessing={Boolean(caseStatus.pp_start_date)}
                estimateLoading={communityEstimateLoading}
                estimatesAvailable={isOptCase}
                filingCategory={caseStatus.filing_category}
              />
            </CaseStatusPanelErrorBoundary>
          </Card>

          {/* ── 6. OPT JOURNEY SECTION ── */}
          {isOptCase && (
            <CaseStatusPanelErrorBoundary area="opt_journey">
              <OptJourneySection
                filingCategory={caseStatus.filing_category}
                optFiledDate={
                  isStemExtension ? null : caseStatus.received_date ?? null
                }
                eadProjected={null}
                stemWindowOpens={null}
                stemFiled={
                  isStemExtension ? caseStatus.received_date ?? null : null
                }
              />
            </CaseStatusPanelErrorBoundary>
          )}

          {/* ── 7. CASE TIMELINE + CASE INFORMATION (original layout) ── */}
          <CaseStatusTimelineAndInfo
            caseStatus={caseStatus}
            safeStatusHistory={safeStatusHistory}
            serviceCenterLocation={serviceCenterLocation}
            filingCategorySaving={filingCategorySaving}
            onFilingCategoryChange={(value) => void handleFilingCategoryUpdate(value)}
            filingDateInput={filingDateInput}
            onFilingDateInputChange={setFilingDateInput}
            filingDateSaving={filingDateSaving}
            onSaveFilingDate={() => void handleSaveFilingDate()}
          />

          {/* ── 7. TOOLS ACCORDION ── */}
          <CaseStatusPanelErrorBoundary area="tools">
            <ToolsAccordion
              notifications={{
                isPremium,
                emailAlertsOn: caseStatus.notifications_enabled,
                emailAddress: notificationEmail,
                isEditingEmail,
                emailSaving,
                onToggleEmail: toggleNotifications,
                onStartEditEmail: () => setIsEditingEmail(true),
                onCancelEditEmail: () => setIsEditingEmail(false),
                onSaveEmail: handleEmailSave,
                onEmailChange: setNotificationEmail,
                onUpgrade: () => openProTrialModal(),
              }}
            />
          </CaseStatusPanelErrorBoundary>

          {/* ── 8b. Manual refresh / stale upsells ── */}
          {showManualRefreshUpsell && (
            <ManualRefreshUpsellPrompt
              onStartTrial={() => openProTrialModal()}
              onDismiss={() => setShowManualRefreshUpsell(false)}
              ctaLabel={proUpgradeCta}
            />
          )}
          {!showManualRefreshUpsell &&
            !showStatusChangeWedge &&
            showStaleStatusUpsell && (
              <ManualRefreshUpsellPrompt
                trigger={CHECKOUT_UPSELL_TRIGGER.STALE_STATUS}
                message={CASE_STATUS_MESSAGING.staleStatusNotice}
                onStartTrial={() => openProTrialModal()}
                onDismiss={() => setShowStaleStatusUpsell(false)}
                ctaLabel={proUpgradeCta}
              />
            )}

          {/* ── Dev: mock mode badge ── */}
          {process.env.NEXT_PUBLIC_USCIS_MOCK === 'true' &&
            process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production' &&
            process.env.NODE_ENV !== 'production' && <UscisMockModeBadge />}

          {/* ── 10. CASE INFO FOOTER (collapsed) ── */}
          <CaseStatusPanelErrorBoundary area="case_info_footer">
            <CaseInfoFooter caseStatus={caseStatus} />
          </CaseStatusPanelErrorBoundary>

          {/* ── 11. DISCLAIMER (single instance) ── */}
          <UscisCaseStatusDisclaimer className="mt-2" />
        </>
      )}

      <CaseStatusDeleteDialog
        casePendingDelete={casePendingDelete}
        isRemoving={isRemoving}
        onOpenChange={(open) => {
          if (!open) setCasePendingDelete(null);
        }}
        onConfirm={() => void confirmDeleteCase()}
      />

      <CaseInsightUpgradeDialog
        open={showCaseInsightUpgrade}
        onOpenChange={setShowCaseInsightUpgrade}
        onUpgrade={() => {
          setShowCaseInsightUpgrade(false);
          openProTrialModal();
        }}
        introEligible={proIntroEligible}
        daysSinceFiled={
          clientNowMs !== null
            ? daysSinceEpochMs(caseStatus?.received_date, clientNowMs)
            : 0
        }
        typicalWaitDays={communitySummary?.medianDays}
        cohortSize={communitySummary?.cohortSize}
      />

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        isPremium={isPremium ?? false}
        initialPlan={pricingModalPlan}
        initialInterval="year"
      />
    </div>
  );
}
