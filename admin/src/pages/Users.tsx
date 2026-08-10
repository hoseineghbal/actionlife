import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/auth-context';
import type { User, UserPermission, UserLevel as UserLevelT } from '../types';
import {
  PERMISSION_GROUPS,
  USER_LEVEL_META,
  USER_LEVEL_ORDER,
  USER_LEVELS,
  LEVEL_GATED_FEATURES,
  LEVEL_REQUIREMENTS,
} from '../types';

const USER_ROLES = [
  { value: 'user', label: 'کاربر عادی' },
  { value: 'vip', label: 'کاربر ویژه' },
  { value: 'author', label: 'نویسنده' },
  { value: 'editor', label: 'ویراستار' },
  { value: 'instructor', label: 'مدرس' },
  { value: 'admin', label: 'ادمین' },
];

interface UserFormData {
  fullName: string;
  mobile: string;
  countryCode: string;
  email: string;
  role: string;
  username: string;
  password: string;
  bio: string;
  birthDate: string;
  gender: string;
  education: string;
  fieldOfStudy: string;
  expertise: string;
  interests: string;
  country: string;
  city: string;
  website: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  cardNumber: string;
  shebaNumber: string;
  isActive: boolean;
  hasStore: boolean;
  points: number;
  permissions: UserPermission[];
  overrideLevel: UserLevelT | '';
  collaborationScore: number;
  activityScore: number;
  challengeProgressScore: number;
  growthPathScore: number;
}

const initialFormData: UserFormData = {
  fullName: '',
  mobile: '',
  countryCode: '+98',
  email: '',
  role: 'user',
  username: '',
  password: '',
  bio: '',
  birthDate: '',
  gender: '',
  education: '',
  fieldOfStudy: '',
  expertise: '',
  interests: '',
  country: '',
  city: '',
  website: '',
  instagram: '',
  linkedin: '',
  twitter: '',
  cardNumber: '',
  shebaNumber: '',
  isActive: true,
  hasStore: false,
  points: 0,
  permissions: [],
  overrideLevel: '',
  collaborationScore: 0,
  activityScore: 0,
  challengeProgressScore: 0,
  growthPathScore: 0,
};

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm transition-all';

const InfoRow = ({ label, value }: { label: string; value?: string | null | number }) => (
  <div className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-gray-400 text-sm min-w-[120px] shrink-0">{label}:</span>
    <span className="text-gray-700 text-sm">{value || '—'}</span>
  </div>
);

function UserLevelBadge({
  level,
  showLabel = true,
  size = 'sm',
}: {
  level: UserLevelT;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}) {
  const meta = USER_LEVEL_META[level];
  if (!meta) return null;
  const fontSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${fontSize} ${padding}`}
      style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}40` }}
    >
      <span
        className="rounded-full"
        style={{
          width: size === 'sm' ? 5 : 7,
          height: size === 'sm' ? 5 : 7,
          backgroundColor: meta.color,
        }}
      />
      {showLabel && meta.label}
    </span>
  );
}

function userLevelFromScores(props: {
  profileCompletenessScore?: number;
  activityScore?: number;
  collaborationScore?: number;
  challengeProgressScore?: number;
  growthPathScore?: number;
  overrideLevel?: UserLevelT | null;
}): { level: UserLevelT; total: number } {
  const profile = props.profileCompletenessScore || 0;
  const activity = props.activityScore || 0;
  const collaboration = props.collaborationScore || 0;
  const challenge = props.challengeProgressScore || 0;
  const growth = props.growthPathScore || 0;
  const total = profile + activity + collaboration + challenge + growth;
  if (props.overrideLevel) {
    return { level: props.overrideLevel, total };
  }
  const sorted = USER_LEVEL_ORDER.slice().sort(
    (a, b) => USER_LEVEL_META[b].minScore - USER_LEVEL_META[a].minScore,
  );
  return {
    level: sorted.find((lvl) => total >= USER_LEVEL_META[lvl].minScore) || 'tier_1_beginner',
    total,
  };
}

/* -------------------- بخش فرم سطح کاربری (Level System) -------------------- */

type ScoreKey =
  | 'collaborationScore'
  | 'activityScore'
  | 'challengeProgressScore'
  | 'growthPathScore';

function ScoreField({
  label,
  value,
  scoreKey,
  max,
  hint,
  color,
  hasAuto,
  autoValue,
  onChange,
}: {
  label: string;
  value: number;
  scoreKey: ScoreKey;
  max: number;
  hint: string;
  color: string;
  hasAuto?: boolean;
  autoValue?: number;
  onChange: <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <div className="flex items-center gap-2">
          <div className="relative w-16">
            <input
              type="number"
              min={0}
              max={max}
              value={value}
              onChange={(e) => onChange(scoreKey, Number(e.target.value))}
              dir="ltr"
              className={`${inputClass} !py-1.5 !px-2 !text-xs text-center font-bold`}
              style={{ color }}
            />
          </div>
          <span className="text-xs text-gray-400">/ {max.toLocaleString('fa-IR')}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (value / max) * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {hasAuto && autoValue !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{hint}</span>
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
            خودکار: {autoValue}
          </span>
        </div>
      )}
      {!hasAuto && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
}

function UserLevelFormSection({
  formData,
  onChange,
}: {
  formData: UserFormData;
  onChange: <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => void;
}) {
  const profileEstimate = useMemo(() => {
    let score = 0;
    if (formData.fullName && formData.fullName.trim().length > 2) score += 10;
    if (formData.mobile || formData.email) score += 10;
    if (formData.username && formData.username.trim().length > 2) score += 10;
    if (formData.bio && formData.bio.trim().length > 20) score += 10;
    if (formData.birthDate || formData.gender) score += 10;
    if (formData.education || formData.fieldOfStudy || formData.expertise) score += 10;
    if (formData.city || formData.country) score += 10;
    if (formData.website || formData.instagram || formData.linkedin || formData.twitter)
      score += 10;
    const interestCount = formData.interests
      ? formData.interests.split(',').filter((s) => s.trim()).length
      : 0;
    if (interestCount >= 2) score += 10;
    return Math.min(100, score);
  }, [
    formData.fullName,
    formData.mobile,
    formData.email,
    formData.username,
    formData.bio,
    formData.birthDate,
    formData.gender,
    formData.education,
    formData.fieldOfStudy,
    formData.expertise,
    formData.city,
    formData.country,
    formData.website,
    formData.instagram,
    formData.linkedin,
    formData.twitter,
    formData.interests,
  ]);

  const calc = useMemo(
    () =>
      userLevelFromScores({
        profileCompletenessScore: profileEstimate,
        activityScore: formData.activityScore,
        collaborationScore: formData.collaborationScore,
        challengeProgressScore: formData.challengeProgressScore,
        growthPathScore: formData.growthPathScore,
        overrideLevel: formData.overrideLevel || null,
      }),
    [
      profileEstimate,
      formData.activityScore,
      formData.collaborationScore,
      formData.challengeProgressScore,
      formData.growthPathScore,
      formData.overrideLevel,
    ],
  );

  const currentLevelIdx = USER_LEVEL_ORDER.indexOf(calc.level);
  const nextLevel = USER_LEVEL_ORDER[currentLevelIdx + 1];
  const nextMeta = nextLevel ? USER_LEVEL_META[nextLevel] : null;
  const progressToNext = nextMeta
    ? Math.min(
        100,
        Math.max(
          0,
          ((calc.total - USER_LEVEL_META[calc.level].minScore) /
            (nextMeta.minScore - USER_LEVEL_META[calc.level].minScore)) *
            100,
        ),
      )
    : 100;

  const unlockedFeatures = LEVEL_GATED_FEATURES.filter((f) => {
    const req = LEVEL_REQUIREMENTS[f.key];
    return USER_LEVEL_ORDER.indexOf(calc.level) >= USER_LEVEL_ORDER.indexOf(req);
  });

  return (
    <section>
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        سطح کاربری (Level System)
      </h3>

      <div
        className="rounded-2xl p-5 mb-5 bg-gradient-to-l from-gray-50 to-white border border-gray-200"
        style={{
          borderRight: `4px solid ${USER_LEVEL_META[calc.level].color}`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <UserLevelBadge level={calc.level} size="md" showLabel={false} />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-gray-800">
                  {USER_LEVEL_META[calc.level].label}
                </h4>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${USER_LEVEL_META[calc.level].color}15`,
                    color: USER_LEVEL_META[calc.level].color,
                  }}
                >
                  {USER_LEVEL_META[calc.level].badgeLabel}
                </span>
                {formData.overrideLevel && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    تنظیم دستی ادمین
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {USER_LEVEL_META[calc.level].description}
              </p>
            </div>
          </div>

          <div className="text-left min-w-[180px]">
            <div className="flex items-baseline justify-end gap-1 mb-1">
              <span className="text-2xl font-extrabold text-gray-800" dir="ltr">
                {calc.total.toLocaleString('fa-IR')}
              </span>
              <span className="text-xs text-gray-400">امتیاز کل</span>
            </div>
            {nextMeta ? (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressToNext}%`,
                      background: `linear-gradient(to left, ${USER_LEVEL_META[calc.level].color}, ${nextMeta.color})`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 text-left">
                  تا سطح «{nextMeta.label}»:
                  <span className="font-bold mr-1" dir="ltr">
                    {(nextMeta.minScore - calc.total).toLocaleString('fa-IR')}
                  </span>
                  امتیاز مانده
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-green-600 font-bold">
                ✦ بالاترین سطح ممکن (پیشکسوت)
              </p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <label className="block text-xs font-bold text-gray-600 mb-2">
            سطوح کاربری پیشرفته
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {USER_LEVEL_ORDER.map((lvl) => {
              const meta = USER_LEVEL_META[lvl];
              const active = lvl === calc.level;
              const passed = USER_LEVEL_ORDER.indexOf(lvl) < currentLevelIdx;
              return (
                <div
                  key={lvl}
                  className={`flex-1 min-w-[90px] rounded-lg p-2 text-center transition-all border ${
                    active
                      ? 'ring-2 shadow-md scale-[1.02]'
                      : passed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-100 opacity-70'
                  }`}
                  style={
                    active
                      ? {
                          borderColor: meta.color,
                          backgroundColor: `${meta.color}10`,
                          boxShadow: `0 4px 12px ${meta.color}22`,
                          ringColor: meta.color,
                        } as any
                      : undefined
                  }
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{
                      backgroundColor: passed || active ? meta.color : '#cbd5e1',
                    }}
                  />
                  <p className="text-[11px] font-bold" style={{ color: active || passed ? meta.color : '#94a3b8' }}>
                    {meta.label}
                  </p>
                  <p className="text-[9px] text-gray-400" dir="ltr">
                    {meta.minScore}+
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ScoreField
          label="۱) تکمیل اطلاعات پروفایل"
          value={profileEstimate}
          scoreKey="activityScore"
          max={100}
          color="#0ea5e9"
          hint="تولید خودکار بر اساس فیلدهای پروفایل (غیر قابل تغییر)"
          hasAuto
          autoValue={profileEstimate}
          onChange={onChange}
        />
        <ScoreField
          label="۲) میزان فعالیت"
          value={formData.activityScore}
          scoreKey="activityScore"
          max={5000}
          color="#22c55e"
          hint="ورود روزانه، بازدید، تراکنش، خرید، تعاملات"
          onChange={onChange}
        />
        <ScoreField
          label="۳) میزان همکاری"
          value={formData.collaborationScore}
          scoreKey="collaborationScore"
          max={3000}
          color="#f97316"
          hint="ساخت محتوا، فروش فروشگاه، کمک به کاربران دیگر"
          onChange={onChange}
        />
        <ScoreField
          label="۴) پیشرفت در چالش‌ها"
          value={formData.challengeProgressScore}
          scoreKey="challengeProgressScore"
          max={3000}
          color="#ec4899"
          hint="شرکت در چالش‌ها، اتمام موفق و کسب رتبه برتر"
          onChange={onChange}
        />
        <ScoreField
          label="۵) مسیر رشد"
          value={formData.growthPathScore}
          scoreKey="growthPathScore"
          max={5000}
          color="#8b5cf6"
          hint="گذراندن گام‌ها، دوره‌ها و کسب مدارک"
          onChange={onChange}
        />
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-sm font-bold text-gray-800 mb-3">تغییر دستی سطح</p>
          <select
            className={inputClass}
            value={formData.overrideLevel}
            onChange={(e) => onChange('overrideLevel', (e.target.value || '') as any)}
          >
            <option value="">⚖️ محاسبه خودکار (پیش‌فرض)</option>
            {USER_LEVELS.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label} — {USER_LEVEL_META[lvl.value].badgeLabel}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 mt-2 leading-5">
            در صورت انتخاب، سطح کاربر نادیده گرفته می‌شود و در جایزه‌ها و رویدادهای خاص
            (مثل جشنواره یا قدردانی ویژه) استفاده شود.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-3">
          امکانات فعال برای این سطح کاربری:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {LEVEL_GATED_FEATURES.map((feature) => {
            const req = LEVEL_REQUIREMENTS[feature.key];
            const unlocked = unlockedFeatures.some((f) => f.key === feature.key);
            const reqMeta = USER_LEVEL_META[req];
            return (
              <div
                key={feature.key}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                  unlocked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <span
                  className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'
                  }`}
                >
                  {unlocked ? '✓' : '🔒'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">
                    {feature.label}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    نیازمند سطح «{reqMeta.label}» — {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PermissionPicker({
  value,
  onChange,
  role,
}: {
  value: UserPermission[];
  onChange: (v: UserPermission[]) => void;
  role: string;
}) {
  const allPerms = useMemo(
    () => PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.value)),
    []
  );
  const allSelected = allPerms.every((p) => value.includes(p));

  const toggleAll = () => {
    onChange(allSelected ? [] : allPerms);
  };

  const toggleGroup = (groupPerms: UserPermission[]) => {
    const groupAllSelected = groupPerms.every((p) => value.includes(p));
    if (groupAllSelected) {
      onChange(value.filter((p) => !groupPerms.includes(p)));
    } else {
      onChange(Array.from(new Set([...value, ...groupPerms])));
    }
  };

  const toggleOne = (perm: UserPermission) => {
    if (value.includes(perm)) {
      onChange(value.filter((p) => p !== perm));
    } else {
      onChange([...value, perm]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 text-accent rounded focus:ring-accent"
          />
          <span className="text-sm font-bold text-gray-800">انتخاب همه دسترسی‌ها</span>
        </label>
        {role === 'admin' && value.length === 0 && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            پیشنهاد: برای ادمین اصلی، همه دسترسی‌ها فعال باشد
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERMISSION_GROUPS.map((group) => {
          const groupPerms = group.items.map((i) => i.value);
          const groupSelected = groupPerms.every((p) => value.includes(p));
          const partial = groupPerms.some((p) => value.includes(p)) && !groupSelected;
          return (
            <div
              key={group.label}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50/50"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={groupSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = partial;
                    }}
                    onChange={() => toggleGroup(groupPerms)}
                    className="w-4 h-4 text-accent rounded focus:ring-accent"
                  />
                  <span className="text-sm font-bold text-gray-800">{group.label}</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded hover:bg-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(item.value)}
                      onChange={() => toggleOne(item.value)}
                      className="w-3.5 h-3.5 text-accent rounded focus:ring-accent shrink-0"
                    />
                    <span className="text-xs text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserFormModal({
  mode,
  user,
  onClose,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  user?: User;
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [formData, setFormData] = useState<UserFormData>(() => {
    if (mode === 'edit' && user) {
      return {
        fullName: user.fullName,
        mobile: user.mobile,
        countryCode: user.countryCode || '+98',
        email: user.email || '',
        role: user.role,
        username: user.username || '',
        password: '',
        bio: user.bio || '',
        birthDate: user.birthDate || '',
        gender: user.gender || '',
        education: user.education || '',
        fieldOfStudy: user.fieldOfStudy || '',
        expertise: user.expertise || '',
        interests: (user.interests || []).join(', '),
        country: user.country || '',
        city: user.city || '',
        website: user.website || '',
        instagram: user.instagram || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        cardNumber: user.cardNumber || '',
        shebaNumber: user.shebaNumber || '',
        isActive: user.isActive,
        hasStore: user.hasStore,
        points: user.points,
        permissions: (user.permissions as UserPermission[]) || [],
        overrideLevel: user.overrideLevel || '',
        collaborationScore: user.collaborationScore || 0,
        activityScore: user.activityScore || 0,
        challengeProgressScore: user.challengeProgressScore || 0,
        growthPathScore: user.growthPathScore || 0,
      };
    }
    return initialFormData;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRoleChange = (newRole: string) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: newRole === 'admin' ? prev.permissions : [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload: any = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        countryCode: formData.countryCode || '+98',
        email: formData.email || undefined,
        role: formData.role,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender || undefined,
        education: formData.education || undefined,
        fieldOfStudy: formData.fieldOfStudy || undefined,
        expertise: formData.expertise || undefined,
        interests: formData.interests
          ? formData.interests.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
        cardNumber: formData.cardNumber || undefined,
        shebaNumber: formData.shebaNumber || undefined,
        isActive: formData.isActive,
        hasStore: formData.hasStore,
        points: formData.points,
        permissions: formData.role === 'admin' ? formData.permissions : undefined,
        overrideLevel: formData.role !== 'admin'
          ? (formData.overrideLevel || null)
          : undefined,
        collaborationScore: formData.role !== 'admin' ? formData.collaborationScore : undefined,
        activityScore: formData.role !== 'admin' ? formData.activityScore : undefined,
        challengeProgressScore: formData.role !== 'admin' ? formData.challengeProgressScore : undefined,
        growthPathScore: formData.role !== 'admin' ? formData.growthPathScore : undefined,
      };

      if (mode === 'create') {
        if (!formData.password) {
          setError('رمز عبور الزامی است');
          setSubmitting(false);
          return;
        }
        payload.password = formData.password;
      } else {
        if (formData.password) {
          payload.password = formData.password;
        }
      }

      const res =
        mode === 'create'
          ? await api.post<User>('/users', payload)
          : await api.put<User>(`/users/${user!._id}`, payload);

      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ذخیره اطلاعات');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-8 lg:inset-16 bg-white z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'create' ? 'ایجاد کاربر جدید' : `ویرایش کاربر: ${user?.fullName}`}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                اطلاعات اصلی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="نام کامل" required>
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="مثال: علی رضایی"
                  />
                </Field>
                <Field label="شماره موبایل" required>
                  <input
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    value={formData.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    placeholder="9121111111"
                  />
                </Field>
                <Field label="کد کشور">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.countryCode}
                    onChange={(e) => updateField('countryCode', e.target.value)}
                    placeholder="+98"
                  />
                </Field>
                <Field label="ایمیل">
                  <input
                    type="email"
                    dir="ltr"
                    className={inputClass}
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="example@email.com"
                  />
                </Field>
                <Field label="نام کاربری">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="username"
                  />
                </Field>
                <Field label="نقش کاربر" required>
                  <select
                    className={inputClass}
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={`رمز عبور${mode === 'edit' ? ' (خالی بگذارید برای عدم تغییر)' : ''}`} required={mode === 'create'}>
                  <input
                    type="password"
                    dir="ltr"
                    className={inputClass}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="حداقل ۶ کاراکتر"
                    minLength={mode === 'create' ? 6 : undefined}
                  />
                </Field>
                <Field label="امتیاز کاربر">
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.points}
                    onChange={(e) => updateField('points', Number(e.target.value))}
                    min={0}
                  />
                </Field>
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6 pt-2 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => updateField('isActive', e.target.checked)}
                      className="w-4 h-4 text-accent rounded focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">کاربر فعال است</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasStore}
                      onChange={(e) => updateField('hasStore', e.target.checked)}
                      className="w-4 h-4 text-accent rounded focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">دسترسی فروشگاه دارد</span>
                  </label>
                </div>
              </div>
            </section>

            {formData.role === 'admin' && (
              <section>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  سطوح دسترسی (Permissions)
                </h3>
                <PermissionPicker
                  value={formData.permissions}
                  onChange={(v) => updateField('permissions', v)}
                  role={formData.role}
                />
              </section>
            )}

            {formData.role !== 'admin' && (
              <UserLevelFormSection
                formData={formData}
                onChange={updateField}
              />
            )}

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                اطلاعات پروفایل و شخصی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="بیوگرافی">
                  <textarea
                    className={`${inputClass} h-24 resize-none`}
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="معرفی کوتاه کاربر..."
                  />
                </Field>
                <Field label="تاریخ تولد">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    placeholder="1370/01/01"
                  />
                </Field>
                <Field label="جنسیت">
                  <select
                    className={inputClass}
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </Field>
                <Field label="مقطع تحصیلی">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.education}
                    onChange={(e) => updateField('education', e.target.value)}
                    placeholder="کارشناسی"
                  />
                </Field>
                <Field label="رشته تحصیلی">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.fieldOfStudy}
                    onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                    placeholder="مهندسی کامپیوتر"
                  />
                </Field>
                <Field label="تخصص / حرفه">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.expertise}
                    onChange={(e) => updateField('expertise', e.target.value)}
                    placeholder="برنامه‌نویس"
                  />
                </Field>
                <Field label="علایق (با کاما جدا کنید)">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.interests}
                    onChange={(e) => updateField('interests', e.target.value)}
                    placeholder="علمی, فرهنگی, ورزشی"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                محل زندگی و ارتباطات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="کشور">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="ایران"
                  />
                </Field>
                <Field label="شهر">
                  <input
                    type="text"
                    className={inputClass}
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="تهران"
                  />
                </Field>
                <Field label="وبسایت">
                  <input
                    type="url"
                    dir="ltr"
                    className={inputClass}
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="اینستاگرام">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value)}
                    placeholder="@username"
                  />
                </Field>
                <Field label="لینکدین">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.linkedin}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/"
                  />
                </Field>
                <Field label="توییتر">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.twitter}
                    onChange={(e) => updateField('twitter', e.target.value)}
                    placeholder="@username"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                اطلاعات بانکی
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="شماره کارت بانکی">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.cardNumber}
                    onChange={(e) => updateField('cardNumber', e.target.value)}
                    placeholder="16 رقم"
                  />
                </Field>
                <Field label="شماره شبا">
                  <input
                    type="text"
                    dir="ltr"
                    className={inputClass}
                    value={formData.shebaNumber}
                    onChange={(e) => updateField('shebaNumber', e.target.value)}
                    placeholder="IR..."
                  />
                </Field>
              </div>
            </section>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {mode === 'create' ? 'ایجاد کاربر' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </>
  );
}

function UserDetailModal({
  user,
  onClose,
  onEdit,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('users:edit');
  const genderLabels: Record<string, string> = { male: 'مرد', female: 'زن' };

  const userPerms = (user.permissions || []) as UserPermission[];
  const allPermsCount = PERMISSION_GROUPS.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-full sm:max-w-lg bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">جزئیات کاربر</h2>
            {canEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                ویرایش
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xl font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{user.fullName}</h3>
              <p className="text-sm text-gray-500" dir="ltr">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : user.role === 'vip'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {USER_ROLES.find((r) => r.value === user.role)?.label || user.role}
                </span>
                {user.role !== 'admin' && (
                  <>
                    <UserLevelBadge level={user.level as UserLevelT} />
                    {user.overrideLevel && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        سطح دستی ادمین
                      </span>
                    )}
                  </>
                )}
                {user.role === 'admin' && (
                  <span className="text-xs text-gray-500">
                    {userPerms.length} از {allPermsCount} دسترسی
                  </span>
                )}
              </div>
            </div>
          </div>
          {user.bio && (
            <p className="mt-3 text-sm text-gray-600 leading-6 bg-white rounded-lg p-3 border border-gray-100">
              {user.bio}
            </p>
          )}
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              اطلاعات پایه
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="نام کاربری" value={user.username} />
              <InfoRow label="موبایل" value={user.mobile} />
              <InfoRow label="تاریخ تولد" value={user.birthDate} />
              <InfoRow label="جنسیت" value={user.gender ? genderLabels[user.gender] || user.gender : undefined} />
              <InfoRow label="نقش" value={USER_ROLES.find((r) => r.value === user.role)?.label || user.role} />
              <InfoRow label="امتیاز" value={String(user.points)} />
              <InfoRow label="وضعیت" value={user.isActive ? 'فعال' : 'غیرفعال'} />
              <InfoRow label="تاریخ عضویت" value={new Date(user.createdAt).toLocaleDateString('fa-IR')} />
            </div>
          </div>

          {user.role !== 'admin' && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                سطح کاربری
                <span className="font-normal text-xs text-gray-400 mr-2" dir="ltr">
                  (امتیاز کل: {(user.levelScore || 0).toLocaleString('fa-IR')})
                </span>
              </h4>
              <div
                className="rounded-xl p-4 bg-gradient-to-l from-gray-50 to-white border border-gray-200 mb-3"
                style={{
                  borderRight: `4px solid ${USER_LEVEL_META[user.level as UserLevelT]?.color || '#94a3b8'}`,
                }}
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <UserLevelBadge level={user.level as UserLevelT} size="md" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {USER_LEVEL_META[user.level as UserLevelT]?.label}
                        <span
                          className="mr-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${USER_LEVEL_META[user.level as UserLevelT]?.color}15`,
                            color: USER_LEVEL_META[user.level as UserLevelT]?.color,
                          }}
                        >
                          {USER_LEVEL_META[user.level as UserLevelT]?.badgeLabel}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {USER_LEVEL_META[user.level as UserLevelT]?.description}
                      </p>
                    </div>
                  </div>
                  {user.overrideLevel && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                      ⚠️ تنظیم دستی ادمین
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'کامل بودن اطلاعات', value: user.profileCompletenessScore, max: 100, color: '#0ea5e9' },
                  { label: 'میزان فعالیت', value: user.activityScore, max: 5000, color: '#22c55e' },
                  { label: 'همکاری در پلتفرم', value: user.collaborationScore, max: 3000, color: '#f97316' },
                  { label: 'پیشرفت چالش‌ها', value: user.challengeProgressScore, max: 3000, color: '#ec4899' },
                  { label: 'مسیر رشد', value: user.growthPathScore, max: 5000, color: '#8b5cf6' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-bold text-gray-700">{item.label}</p>
                      <span className="text-[11px] font-bold" dir="ltr" style={{ color: item.color }}>
                        {(item.value || 0).toLocaleString('fa-IR')}
                        <span className="text-gray-400 font-normal">
                          /{item.max.toLocaleString('fa-IR')}
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, ((item.value || 0) / item.max) * 100)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">امکانات فعال برای کاربر:</p>
                <div className="flex flex-wrap gap-1.5">
                  {LEVEL_GATED_FEATURES.map((feature) => {
                    const req = LEVEL_REQUIREMENTS[feature.key];
                    const unlocked =
                      USER_LEVEL_ORDER.indexOf(user.level as UserLevelT) >=
                      USER_LEVEL_ORDER.indexOf(req);
                    return (
                      <div
                        key={feature.key}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border ${
                          unlocked
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 bg-white/60 border">
                          {unlocked ? '✓' : '🔒'}
                        </span>
                        <span>{feature.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(user.role === 'admin' || userPerms.length > 0) && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                دسترسی‌ها
                <span className="text-xs text-gray-400 font-normal">
                  ({userPerms.length}/{allPermsCount})
                </span>
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {PERMISSION_GROUPS.map((group) => {
                  const groupPerms = group.items.filter((i) => userPerms.includes(i.value));
                  if (groupPerms.length === 0) return null;
                  return (
                    <div key={group.label}>
                      <p className="text-xs font-bold text-gray-500 mb-1.5">{group.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {groupPerms.map((p) => (
                          <span
                            key={p.value}
                            className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full"
                          >
                            {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {userPerms.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    دسترسی خاصی برای این کاربر تنظیم نشده است
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
              </svg>
              تحصیلات و تخصص
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="مقطع تحصیلی" value={user.education} />
              <InfoRow label="رشته تحصیلی" value={user.fieldOfStudy} />
              <InfoRow label="تخصص / حرفه" value={user.expertise} />
            </div>
            {user.interests && user.interests.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-400 block mb-2">علایق:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              محل زندگی
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="کشور" value={user.country} />
              <InfoRow label="شهر" value={user.city} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              شبکه‌های اجتماعی
            </h4>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="وبسایت" value={user.website} />
              <InfoRow label="اینستاگرام" value={user.instagram} />
              <InfoRow label="لینکدین" value={user.linkedin} />
              <InfoRow label="توییتر" value={user.twitter} />
            </div>
          </div>

          {(user.cardNumber || user.shebaNumber) && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                اطلاعات بانکی
              </h4>
              <div className="bg-gray-50 rounded-lg px-4">
                <InfoRow label="شماره کارت" value={user.cardNumber} />
                <InfoRow label="شماره شبا" value={user.shebaNumber} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Users() {
  const { hasPermission } = useAuth();
  const canView = hasPermission('users:view');
  const canCreate = hasPermission('users:create');
  const canEdit = hasPermission('users:edit');

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const loadUsers = () => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get<User[]>('/users')
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [canView]);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.mobile && u.mobile.includes(search))
  );

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    editor: 'bg-blue-100 text-blue-700',
    author: 'bg-green-100 text-green-700',
    instructor: 'bg-purple-100 text-purple-700',
    user: 'bg-gray-100 text-gray-700',
    vip: 'bg-yellow-100 text-yellow-700',
  };

  const handleCreateSuccess = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setFormMode(null);
  };

  const handleEditSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
    if (selectedUser && selectedUser._id === updatedUser._id) {
      setSelectedUser(updatedUser);
    }
    setFormMode(null);
    setEditTarget(null);
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-7a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">دسترسی محدود</h3>
          <p className="text-gray-500 text-sm">
            برای مشاهده لیست کاربران مجوز لازم را ندارید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">کاربران</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{filtered.length} کاربر</span>
          {canCreate && (
            <button
              onClick={() => setFormMode('create')}
              className="px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ایجاد کاربر جدید
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="جستجو بر اساس نام، ایمیل یا موبایل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b">
                  <th className="text-right px-5 py-3 font-medium">نام</th>
                  <th className="text-right px-5 py-3 font-medium">ایمیل</th>
                  <th className="text-right px-5 py-3 font-medium">موبایل</th>
                  <th className="text-right px-5 py-3 font-medium">نقش</th>
                  <th className="text-right px-5 py-3 font-medium">سطح کاربری</th>
                  <th className="text-right px-5 py-3 font-medium">سطح دسترسی</th>
                  <th className="text-right px-5 py-3 font-medium">امتیاز</th>
                  <th className="text-right px-5 py-3 font-medium">وضعیت</th>
                  <th className="text-right px-5 py-3 font-medium">فروشگاه</th>
                  <th className="text-right px-5 py-3 font-medium">درخواست فروشگاه</th>
                  <th className="text-right px-5 py-3 font-medium">تاریخ عضویت</th>
                  {canEdit && (
                    <th className="text-right px-5 py-3 font-medium">عملیات</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const permCount = (user.permissions || []).length;
                  const totalPerms = PERMISSION_GROUPS.reduce((s, g) => s + g.items.length, 0);
                  return (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600" dir="ltr">{user.email}</td>
                      <td className="px-5 py-4 text-gray-600" dir="ltr">{user.mobile || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                          {USER_ROLES.find((r) => r.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.role !== 'admin' ? (
                          <div className="flex items-center gap-3">
                            <UserLevelBadge level={user.level as UserLevelT} />
                            <div className="min-w-[90px]">
                              <div className="flex items-baseline gap-1 text-gray-600 text-xs" dir="ltr">
                                <span className="font-bold">{(user.levelScore || 0).toLocaleString('fa-IR')}</span>
                              </div>
                              {user.overrideLevel && (
                                <span className="text-[10px] text-amber-600 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                                  دستی
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.role === 'admin' ? (
                          <>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  permCount === totalPerms ? 'bg-green-500' : permCount > 0 ? 'bg-accent' : 'bg-gray-300'
                                }`}
                                style={{ width: `${totalPerms ? (permCount / totalPerms) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500 mt-0.5 inline-block">
                              {permCount}/{totalPerms}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{user.points}</td>
                      <td className="px-5 py-4">
                        <span className={`w-2 h-2 rounded-full inline-block ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="mr-2 text-gray-600">{user.isActive ? 'فعال' : 'غیرفعال'}</span>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={!canEdit}
                          onClick={async () => {
                            try {
                              await api.put(`/users/${user._id}`, { hasStore: !user.hasStore });
                              setUsers((prev) =>
                                prev.map((u) =>
                                  u._id === user._id ? { ...u, hasStore: !u.hasStore } : u,
                                ),
                              );
                            } catch (err: any) {
                              alert(err.response?.data?.message || 'خطا در تغییر دسترسی');
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            user.hasStore
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user.hasStore ? 'فعال' : 'غیرفعال'}
                        </button>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {user.storeRequestStatus === 'pending' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-600 text-xs">در انتظار</span>
                            {canEdit && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.put(`/users/${user._id}/store-request`, { action: 'approve' });
                                      setUsers((prev) =>
                                        prev.map((u) =>
                                          u._id === user._id
                                            ? { ...u, hasStore: true, storeRequestStatus: 'approved' }
                                            : u,
                                        ),
                                      );
                                    } catch (err: any) {
                                      alert(err.response?.data?.message || 'خطا');
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                >
                                  تایید
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.put(`/users/${user._id}/store-request`, { action: 'reject' });
                                      setUsers((prev) =>
                                        prev.map((u) =>
                                          u._id === user._id
                                            ? { ...u, storeRequestStatus: 'rejected' }
                                            : u,
                                        ),
                                      );
                                    } catch (err: any) {
                                      alert(err.response?.data?.message || 'خطا');
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                >
                                  رد
                                </button>
                              </>
                            )}
                          </div>
                        ) : user.storeRequestStatus === 'approved' ? (
                          <span className="text-green-600 text-xs">تایید شده</span>
                        ) : user.storeRequestStatus === 'rejected' ? (
                          <span className="text-red-500 text-xs">رد شده</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      {canEdit && (
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditTarget(user);
                              setFormMode('edit');
                            }}
                            className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="ویرایش کاربر"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={canEdit ? 11 : 10} className="text-center py-10 text-gray-400">
                      کاربری یافت نشد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && !formMode && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setEditTarget(selectedUser);
            setFormMode('edit');
          }}
        />
      )}

      {formMode === 'create' && (
        <UserFormModal
          mode="create"
          onClose={() => setFormMode(null)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {formMode === 'edit' && editTarget && (
        <UserFormModal
          mode="edit"
          user={editTarget}
          onClose={() => {
            setFormMode(null);
            setEditTarget(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
