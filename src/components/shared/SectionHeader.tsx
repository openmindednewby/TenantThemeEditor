/**
 * Reusable section header with title and description.
 */

interface SectionHeaderProps {
  title: string;
  description: string;
}

export const SectionHeader = ({
  title,
  description,
}: SectionHeaderProps): JSX.Element => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    <p className="mt-1 text-xs text-text-secondary">{description}</p>
  </div>
);
