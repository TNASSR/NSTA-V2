import React, { useState, useEffect } from 'react';
import { User, IICPost } from '../types';
import { Image, Video, Trash2, Plus, ArrowLeft } from 'lucide-react';

interface Props { user: User; onBack: () => void; }

export const IICPage: React.FC<Props> = ({ user, onBack }) => {
  const [posts, setPosts] = useState<IICPost[]>([]);
  const isAdmin = user.role === 'ADMIN';
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'TEXT' as any });

  useEffect(() => { const p = localStorage.getItem('nst_iic_posts'); if(p) setPosts(JSON.parse(p)); }, []);

  const addPost = () => {
      if(!newPost.content) return;
      const post: IICPost = { id: Date.now().toString(), ...newPost, timestamp: new Date().toISOString(), authorName: 'Director Ehsan Sir' };
      const updated = [post, ...posts]; setPosts(updated); localStorage.setItem('nst_iic_posts', JSON.stringify(updated));
      setNewPost({ title: '', content: '', type: 'TEXT' });
  };

  const deletePost = (id: string) => {
      const updated = posts.filter(p => p.id !== id); setPosts(updated); localStorage.setItem('nst_iic_posts', JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center mb-8"><button onClick={onBack} className="mr-4 font-bold text-slate-500">Back</button><h2 className="text-2xl font-black text-blue-900">Ideal Inspiration Classes</h2></div>
      
      {isAdmin && (
          <div className="bg-slate-50 p-4 rounded-xl border mb-8">
              <h3 className="font-bold mb-2">New Post</h3>
              <input placeholder="Title" value={newPost.title} onChange={e=>setNewPost({...newPost, title: e.target.value})} className="w-full p-2 border rounded mb-2"/>
              <textarea placeholder="Content / Image URL / Video URL" value={newPost.content} onChange={e=>setNewPost({...newPost, content: e.target.value})} className="w-full p-2 border rounded mb-2"/>
              <div className="flex gap-2">
                  {['TEXT','IMAGE','VIDEO'].map(t => <button key={t} onClick={()=>setNewPost({...newPost, type: t as any})} className={`px-3 py-1 rounded text-xs font-bold ${newPost.type===t?'bg-blue-600 text-white':'bg-white border'}`}>{t}</button>)}
                  <button onClick={addPost} className="ml-auto bg-green-600 text-white px-4 py-1 rounded font-bold">Post</button>
              </div>
          </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
          {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  {post.type === 'IMAGE' && <img src={post.content} className="w-full h-48 object-cover"/>}
                  {post.type === 'VIDEO' && <div className="w-full h-48 bg-black flex items-center justify-center text-white"><Video/> Video Link</div>}
                  <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{post.title || 'Update'}</h3>
                          {isAdmin && <button onClick={()=>deletePost(post.id)} className="text-red-400"><Trash2 size={16}/></button>}
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{post.type === 'TEXT' ? post.content : post.type === 'VIDEO' ? 'Click link to watch video' : ''}</p>
                      <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase">{new Date(post.timestamp).toLocaleDateString()} • {post.authorName}</div>
                  </div>
              </div>
          ))}
          {posts.length===0 && <div className="text-center p-10 text-slate-400 col-span-2">No updates yet from IIC.</div>}
      </div>
    </div>
  );
};

