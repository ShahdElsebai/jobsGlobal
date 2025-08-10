import { FormControl } from '@angular/forms';

export interface ApplicationFormItems {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  country: FormControl<string | null>;
  education: FormControl<string | null>;
  position: FormControl<string | null>;
  company: FormControl<string | null>;
  coverLetter: FormControl<string | null>;
}
