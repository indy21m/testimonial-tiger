'use client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createId } from '@paralleldrive/cuid2'

interface Question {
  id: string
  type: 'text' | 'textarea' | 'rating' | 'select'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface QuestionBuilderProps {
  questions: Question[]
  onChange: (questions: Question[]) => void
}

function SortableQuestionItem({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className={`p-4 ${isDragging ? 'shadow-lg' : ''}`}>
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {question.type}
              </Badge>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) =>
                    onUpdate({ ...question, required: e.target.checked })
                  }
                  className="rounded"
                />
                Required
              </label>
            </div>

            <div>
              <Label className="text-xs">Question Label</Label>
              <Input
                value={question.label}
                onChange={(e) =>
                  onUpdate({ ...question, label: e.target.value })
                }
                placeholder="Enter your question"
                className="mt-1"
              />
            </div>

            {(question.type === 'text' || question.type === 'textarea') && (
              <div>
                <Label className="text-xs">Placeholder Text</Label>
                <Input
                  value={question.placeholder || ''}
                  onChange={(e) =>
                    onUpdate({ ...question, placeholder: e.target.value })
                  }
                  placeholder="Placeholder text (optional)"
                  className="mt-1"
                />
              </div>
            )}

            {question.type === 'select' && (
              <div>
                <Label className="text-xs">Options (one per line)</Label>
                <textarea
                  value={question.options?.join('\n') || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      options: e.target.value
                        .split('\n')
                        .filter((o) => o.trim()),
                    })
                  }
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  rows={3}
                />
              </div>
            )}
          </div>

          <button
            onClick={onDelete}
            className="mt-1 rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </Card>
    </div>
  )
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      onChange(arrayMove(questions, oldIndex, newIndex))
    }
  }

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: createId(),
      type,
      label: `New ${type} question`,
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    }
    onChange([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    onChange(newQuestions)
  }

  const deleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          {questions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No custom questions yet. Add one below!
            </div>
          ) : (
            <div>
              {questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  onUpdate={(q) => updateQuestion(index, q)}
                  onDelete={() => deleteQuestion(index)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 border-t pt-4">
        <Button size="sm" variant="outline" onClick={() => addQuestion('text')}>
          + Text
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addQuestion('textarea')}
        >
          + Long Text
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addQuestion('rating')}
        >
          + Rating
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addQuestion('select')}
        >
          + Dropdown
        </Button>
      </div>
    </div>
  )
}
