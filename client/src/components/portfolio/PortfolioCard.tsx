import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CaseStudy } from "@shared/schema";
import { Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PortfolioCardProps {
  caseStudy: CaseStudy;
  username: string;
  isActionable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PortfolioCard({ 
  caseStudy, 
  username, 
  isActionable = false,
  onEdit,
  onDelete
}: PortfolioCardProps) {
  const { id, title, summary, coverImage, slug, tools = [], status } = caseStudy;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
      <Link href={`/${username}/${slug}`} className="block group h-full">
        <div className="relative pb-[60%] bg-slate-100">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/800x500/f1f5f9/64748b?text=${encodeURIComponent(title)}`;
              }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100 rounded-t-lg">
              <ImageIcon className="h-12 w-12 text-slate-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
    {isActionable ? (
      <Select
        value={caseStudy.status}
        onValueChange={(value) => {
          fetch(`/api/portfolio/${caseStudy.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: value })
          })
          .then(response => response.json())
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
            toast({
              title: "Status updated",
              description: "Case study status has been updated successfully"
            });
          })
          .catch(() => {
            toast({
              title: "Error",
              description: "Failed to update case study status",
              variant: "destructive"
            });
          });
        }}
      >
        <SelectTrigger className="h-7 w-24">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
    ) : caseStudy.status === "draft" && (
      <Badge variant="secondary">Draft</Badge>
    )}
  </div>
        </div>
        <CardContent className="p-5">
          <h3 className="text-xl font-semibold mb-2 text-slate-800 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          <p className="text-slate-600 mb-3 line-clamp-2">{summary}</p>

          {tools && tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Array.isArray(tools) && tools.map((tool, index) => (
                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                  {tool}
                </span>
              ))}
            </div>
          )}

          {isActionable && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onEdit) onEdit();
                }}
                className="text-primary hover:text-indigo-700 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onDelete) onDelete();
                }}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}