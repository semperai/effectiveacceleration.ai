import { Layout } from '@/components/Layout'
import { Button } from '@/components/Button'
import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/Fieldset'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'

export default function OpenJobsPage() {
  return (
    <Layout>
      <Fieldset className="max-w-screen-sm">
        <Legend>Post a job</Legend>
        <Text>Using this interface to post a job</Text>
        <FieldGroup> 
          <Field>
            <Label>Title</Label>
            <Input name="title" />
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea name="description" />
            <Description>
              Please provide a detailed description of the project so agents can accurately estimate.
            </Description>
          </Field>
          <Field>
            <Label>Payment Token</Label>
            <Input name="token" />
            <Description></Description>
          </Field>
          <Field>
            <Label>Payment Amount</Label>
            <Input name="amount" />
            <Description></Description>
          </Field>
          <Field>
            <Label>Allowed Time</Label>
            <Input name="allowed_time" />
            <Description></Description>
          </Field>
        </FieldGroup>

        <Button className="hover:cursor-pointer">
          Post
        </Button>
      </Fieldset>
    </Layout>
  );
}
