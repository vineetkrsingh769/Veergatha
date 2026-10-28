import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ReactNode } from 'react';
export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : (e as {message?:string})?.message || 'Something went wrong');
export function check<T>(r: {data:T;error:{message:string}|null}):T { if(r.error) throw new Error(r.error.message); return r.data; }
export function useEditorRole(){ return useQuery({queryKey:['desk','role'],queryFn:async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error('Please sign in');const roles=check(await supabase.from('user_roles').select('role').eq('user_id',user.id))??[];return {user,isAdmin:roles.some(r=>r.role==='admin'),isEditor:roles.length>0};}}); }
export function useSignOut(){const qc=useQueryClient();const navigate=useNavigate();return async()=>{await qc.cancelQueries();qc.clear();await supabase.auth.signOut();await navigate({to:'/auth',search:{redirect:undefined},replace:true});};}
export function Loading(){return <div className="space-y-4" aria-label="Loading"><Skeleton className="h-12 w-2/3"/><Skeleton className="h-64 w-full"/></div>}
export function Heading({title,children}:{title:string;children?:ReactNode}){return <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Veergatha · Editorial Desk</p><h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{title}</h1></div>{children}</header>}
export function Field({label,value,onChange,type='text',required=false}:{label:string;value:unknown;onChange:(v:string)=>void;type?:string;required?:boolean}){return <label className="block space-y-2 text-sm"><span className="text-muted-foreground">{label}</span>{type==='textarea'?<Textarea value={String(value??'')} onChange={e=>onChange(e.target.value)} required={required}/>:<Input type={type} step={type==='number'?'any':undefined} value={String(value??'')} onChange={e=>onChange(e.target.value)} required={required}/>}</label>}
export const slugify=(v:string)=>v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
